#!/usr/bin/env python3
"""
process_data.py - welfare_raw.json(API 원본)을 Jekyll 페이지 생성용 JSON으로 가공 + 카카오 지오코딩

이 API(사회복지시설정보서비스)는 주소만 주고 좌표를 안 주기 때문에, 카카오 로컬 키워드
검색으로 주소→좌표를 보강한다(hosppass의 장기요양기관 카카오 지오코딩과 동일 패턴).
재실행 시 이미 지오코딩된 항목은 건너뛰고 이어서 진행(캐시 파일: _rawdata/welfare_geo_cache.json).

입력: _rawdata/welfare_raw.json
출력: _rawdata/welfare.json (개별 페이지 생성용), search_index.json (검색/지역목록용)

사용법:
  python scripts/process_data.py
"""
import json, re, hashlib, sys, time
from pathlib import Path
from collections import Counter
import requests

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
RAW = ROOT / "_rawdata" / "welfare_raw.json"
FAMILY_RAW = ROOT / "_rawdata" / "family_raw.json"
GEO_CACHE = ROOT / "_rawdata" / "welfare_geo_cache.json"
OUT = ROOT / "_rawdata" / "welfare.json"
SEARCH_INDEX_OUT = ROOT / "search_index.json"

KAKAO_REST_KEY = "02a25c9d9c8a834c12938e84a5235f6d"
KAKAO_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"
KAKAO_HEADERS = {"Authorization": f"KakaoAK {KAKAO_REST_KEY}"}

# API의 fcltKindNm은 상위 분류명이라 030201(장애인복지관)이 "장애인지역사회재활시설"로
# 나옴 — 사용자에게 더 익숙한 구체 명칭으로 정정(하드코딩, 이 4개 코드에만 적용)
CATEGORY_OVERRIDE = {
    "060101": "사회복지관",
    "030201": "장애인복지관",
    "070101": "지역자활센터",
    "010701": "노인일자리지원기관",
}

SIDO_PREFIXES = [
    ("서울특별시", "서울"), ("부산광역시", "부산"), ("인천광역시", "인천"),
    ("대구광역시", "대구"), ("광주광역시", "광주"), ("대전광역시", "대전"),
    ("울산광역시", "울산"), ("세종특별자치시", "세종"),
    ("경기도", "경기"),
    ("강원특별자치도", "강원"), ("강원도", "강원"),
    ("충청북도", "충북"), ("충청남도", "충남"),
    ("전북특별자치도", "전북"), ("전라북도", "전북"), ("전라남도", "전남"),
    ("경상북도", "경북"), ("경상남도", "경남"),
    ("제주특별자치도", "제주"), ("제주도", "제주"),
]


def guess_sido_sggu(jrsd: str):
    text = jrsd or ""
    UNIFIED_PREFIX = "전남광주통합특별시"
    if text.startswith(UNIFIED_PREFIX):
        rest = text[len(UNIFIED_PREFIX):].strip()
        sggu = rest.split()[0] if rest else ""
        short = "광주" if sggu.endswith("구") else "전남"
        return short, sggu
    for prefix, short in SIDO_PREFIXES:
        if text.startswith(prefix):
            rest = text[len(prefix):].strip()
            sggu = rest.split()[0] if rest else ""
            return short, sggu
    return "", ""


def make_slug(name: str, code: str) -> str:
    slug = re.sub(r"[^\w가-힣\s-]", "", name).strip()
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    h = hashlib.md5(f"{name}|{code}".encode("utf-8")).hexdigest()[:6]
    return f"{slug}-{h}" if slug else h


def search_kakao(query: str, attempt: int = 1) -> dict:
    try:
        resp = requests.get(KAKAO_SEARCH_URL, params={"query": query, "size": 1},
                             headers=KAKAO_HEADERS, timeout=15)
        if resp.status_code == 429:  # 쿼터/QPS 초과
            if attempt >= 5:
                return {}
            time.sleep(2 * attempt)
            return search_kakao(query, attempt + 1)
        resp.raise_for_status()
        docs = resp.json().get("documents", [])
        return docs[0] if docs else {}
    except requests.exceptions.RequestException:
        if attempt >= 3:
            return {}
        time.sleep(1.5 * attempt)
        return search_kakao(query, attempt + 1)


def main():
    raw = json.loads(RAW.read_text(encoding="utf-8"))
    geo_cache = json.loads(GEO_CACHE.read_text(encoding="utf-8")) if GEO_CACHE.exists() else {}

    items = []
    seen_slugs = Counter()
    skipped = 0
    geocoded_now = 0

    for d in raw:
        name = (d.get("fcltNm") or "").strip()
        detail = d.get("detail") or {}
        addr1 = (detail.get("fcltAddr") or "").strip()
        addr2 = (detail.get("fcltDtl_1Addr") or "").strip()
        addr = f"{addr1} {addr2}".strip()
        if not name:
            skipped += 1
            continue

        sido_nm, sggu_nm = guess_sido_sggu(d.get("jrsdSggNm", ""))
        if not sido_nm or not sggu_nm:
            skipped += 1
            continue

        slug = make_slug(name, d.get("srvInstId", ""))
        seen_slugs[slug] += 1
        if seen_slugs[slug] > 1:
            slug = f"{slug}-{seen_slugs[slug]}"

        # 지오코딩 (주소 있는 것만, 캐시 우선)
        # 함정: 주소 끝의 "(동명)" 괄호가 붙어있으면 카카오 키워드검색이 0건을 반환하는
        # 경우가 많음(실측: 850/1254건 실패 → 괄호 제거 후 재검색시 대부분 매칭 성공).
        # 표시용 주소(addr)는 괄호 유지, 지오코딩 질의만 괄호 제거한 버전 사용.
        lat, lng = "", ""
        if addr:
            geo_query = re.sub(r"\s*\([^)]*\)\s*$", "", addr).strip() or addr
            cache_key = addr
            if cache_key in geo_cache and geo_cache[cache_key].get("lat"):
                cached = geo_cache[cache_key]
                lat, lng = cached.get("lat", ""), cached.get("lng", "")
            else:
                doc = search_kakao(geo_query)
                lat = doc.get("y", "")
                lng = doc.get("x", "")
                if lat:  # 성공한 것만 캐시(실패는 다음 실행에서 재시도)
                    geo_cache[cache_key] = {"lat": lat, "lng": lng}
                geocoded_now += 1
                if geocoded_now % 50 == 0:
                    print(f"  지오코딩 진행 {geocoded_now}건...")
                    GEO_CACHE.write_text(json.dumps(geo_cache, ensure_ascii=False), encoding="utf-8")
                time.sleep(0.15)

        kind_cd = (d.get("fcltKindCd") or "").strip()
        category = CATEGORY_OVERRIDE.get(kind_cd) or d.get("fcltKindNm", "")

        items.append({
            "welfareName": name,
            "category": category,
            "addr": addr,
            "tel": (detail.get("fcltTelNo") or "").strip(),
            "fax": (detail.get("faxNo") or "").strip(),
            "corp": (detail.get("cprNm") or "").strip(),
            "estbDate": (detail.get("estbDe") or "").strip(),
            "lat": lat,
            "lng": lng,
            "sido_nm": sido_nm,
            "sggu_nm": sggu_nm,
            "slug": slug,
        })

    GEO_CACHE.write_text(json.dumps(geo_cache, ensure_ascii=False), encoding="utf-8")

    # 가족센터(건강가정지원센터) — 위경도·시도/시군구를 API가 직접 줘서 지오코딩·주소파싱 불필요
    family_added = 0
    if FAMILY_RAW.exists():
        family_raw = json.loads(FAMILY_RAW.read_text(encoding="utf-8"))
        for d in family_raw:
            name = (d.get("cnterNm") or "").strip()
            sido_nm = (d.get("ctpvNm") or "").strip()
            sggu_nm = (d.get("sggNm") or "").strip()
            if not name or not sido_nm or not sggu_nm:
                skipped += 1
                continue
            slug = make_slug(name, str(d.get("roadNmAddr", "")))
            seen_slugs[slug] += 1
            if seen_slugs[slug] > 1:
                slug = f"{slug}-{seen_slugs[slug]}"
            items.append({
                "welfareName": name,
                "category": "가족센터",
                "addr": (d.get("roadNmAddr") or "").strip(),
                "tel": (d.get("rprsTelno") or "").strip(),
                "fax": (d.get("fxno") or "").strip(),
                "corp": (d.get("operMbyCn") or "").strip(),
                "estbDate": "",
                "lat": str(d.get("lat") or ""),
                "lng": str(d.get("lot") or ""),
                "sido_nm": sido_nm,
                "sggu_nm": sggu_nm,
                "slug": slug,
            })
            family_added += 1
        print(f"\n가족센터 {family_added}개 추가")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(items, ensure_ascii=False), encoding="utf-8")
    print(f"\n복지시설 {len(items):,}개 저장 → {OUT}  (제외: {skipped}건, 신규 지오코딩: {geocoded_now}건)")

    cat_counts = Counter(i["category"] for i in items)
    print("\n종류별 수:")
    for c, cnt in cat_counts.most_common():
        print(f"  {c}: {cnt}개")
    matched = sum(1 for i in items if i["lat"] and i["lng"])
    print(f"\n좌표 매칭: {matched}/{len(items)}")

    index = [
        {
            "n": i["welfareName"], "slug": i["slug"], "cat": i["category"],
            "doShort": i["sido_nm"], "sigungu": i["sggu_nm"],
        }
        for i in items
    ]
    SEARCH_INDEX_OUT.write_text(json.dumps(index, ensure_ascii=False), encoding="utf-8")
    print(f"검색 인덱스 {len(index)}건 저장 → {SEARCH_INDEX_OUT}")


if __name__ == "__main__":
    main()
