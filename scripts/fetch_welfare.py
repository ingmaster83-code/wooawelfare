#!/usr/bin/env python3
"""
fetch_welfare.py - 한국사회보장정보원_사회복지시설정보서비스(B554287/sclWlfrFcltInfoInqirService2) 수집

대상 시설종류(전부 "이용시설" — 생활시설/보호시설류는 거주자 안전을 위해 주소 비공개가
원칙이라 이 프로젝트에서는 의도적으로 제외함, 2026-09-09 판단):
  060101 사회복지관, 030201 장애인복지관, 070101 지역자활센터, 010701 노인일자리지원기관

1) getFcltListInfoInqire2 로 종류별 목록(시군구명까지) 페이지네이션 수집
2) getFcltByBassInfoInqire2 로 건별 상세(주소·전화번호) 보강 — 1,000여 건 개별 호출

출력: _rawdata/welfare_raw.json

사용법:
  python scripts/fetch_welfare.py
"""
import sys, json, time
from pathlib import Path
import requests
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
RAW_FILE = ROOT / "_rawdata" / "welfare_raw.json"
BASE = "https://apis.data.go.kr/B554287/sclWlfrFcltInfoInqirService2"
SERVICE_KEY = "9490b1d34e92aa9e25b32a4cff1438fc7b9c71e5d332413916a391e867f61e86"

CATEGORIES = {
    "060101": "사회복지관",
    "030201": "장애인복지관",
    "070101": "지역자활센터",
    "010701": "노인일자리지원기관",
    "010301": "노인복지관",
    "030209": "수어통역센터",
}


def xml_items(xml_text: str):
    root = ET.fromstring(xml_text)
    items = root.find(".//items")
    if items is None:
        return []
    out = []
    for item in items.findall("item"):
        out.append({child.tag: (child.text or "").strip() for child in item})
    return out


def get(op: str, params: dict, attempt=1):
    p = dict(params)
    p["serviceKey"] = SERVICE_KEY
    try:
        r = requests.get(f"{BASE}/{op}", params=p, timeout=20)
        r.raise_for_status()
        return xml_items(r.text)
    except Exception as e:
        if attempt >= 4:
            print(f"  [실패] {op} {params}: {e}")
            return []
        time.sleep(2)
        return get(op, params, attempt + 1)


def fetch_list(fclt_kind_cd: str) -> list:
    all_items = []
    page = 1
    while True:
        items = get("getFcltListInfoInqire2", {
            "fcltKindCd": fclt_kind_cd, "pageNo": page, "numOfRows": 100,
        })
        if not items:
            break
        all_items.extend(items)
        if len(items) < 100:
            break
        page += 1
        time.sleep(0.15)
    return all_items


def fetch_detail(srv_inst_id: str) -> dict:
    items = get("getFcltByBassInfoInqire2", {"srvInstId": srv_inst_id})
    return items[0] if items else {}


def main():
    print("=== 사회복지시설(사회복지관·장애인복지관·지역자활센터·노인일자리지원기관) 수집 시작 ===")
    all_facilities = []
    for code, label in CATEGORIES.items():
        items = fetch_list(code)
        print(f"  {label}({code}): {len(items)}곳 목록 수집")
        all_facilities.extend(items)

    print(f"\n총 {len(all_facilities)}곳 — 개별 상세정보(주소·전화번호) 보강 시작")
    for i, f in enumerate(all_facilities, 1):
        srv_id = f.get("srvInstId", "")
        if srv_id:
            detail = fetch_detail(srv_id)
            f["detail"] = detail
        if i % 100 == 0:
            print(f"  진행 {i}/{len(all_facilities)}")
        time.sleep(0.1)

    RAW_FILE.parent.mkdir(parents=True, exist_ok=True)
    RAW_FILE.write_text(json.dumps(all_facilities, ensure_ascii=False), encoding="utf-8")
    print(f"\n저장 완료: {RAW_FILE} ({len(all_facilities)}건)")


if __name__ == "__main__":
    main()
