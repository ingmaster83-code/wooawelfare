#!/usr/bin/env python3
"""
fetch_family.py - 성평등가족부_건강가정지원센터(가족센터) API 수집
apis.data.go.kr/1383000/gmis/hlthHomeSpcnServiceV2/getHlthHomeSpcnListV2

이 API는 위경도를 직접 제공해서 카카오 지오코딩이 불필요함(사회복지시설정보서비스와 차이점).

출력: _rawdata/family_raw.json

사용법:
  python scripts/fetch_family.py
"""
import sys, json, time
from pathlib import Path
import requests

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
RAW_FILE = ROOT / "_rawdata" / "family_raw.json"
BASE = "https://apis.data.go.kr/1383000/gmis/hlthHomeSpcnServiceV2/getHlthHomeSpcnListV2"
SERVICE_KEY = "9490b1d34e92aa9e25b32a4cff1438fc7b9c71e5d332413916a391e867f61e86"


def fetch_page(page: int, attempt=1):
    params = {"serviceKey": SERVICE_KEY, "pageNo": page, "numOfRows": 100, "type": "json"}
    try:
        r = requests.get(BASE, params=params, timeout=20)
        r.raise_for_status()
        data = r.json()
        body = data.get("response", {}).get("body", {})
        items = body.get("items", {})
        if not items or items == "":
            return [], 0
        item = items.get("item", [])
        if isinstance(item, dict):
            item = [item]
        return item, int(body.get("totalCount", 0))
    except Exception as e:
        if attempt >= 4:
            print(f"  [실패] page {page}: {e}")
            return [], 0
        time.sleep(2)
        return fetch_page(page, attempt + 1)


def main():
    print("=== 가족센터(건강가정지원센터) 수집 시작 ===")
    all_items = []
    page = 1
    total = None
    while True:
        items, total_count = fetch_page(page)
        if total is None:
            total = total_count
            print(f"  전체: {total}건")
        if not items:
            break
        all_items.extend(items)
        print(f"  page {page}: 누적 {len(all_items)}/{total}")
        if len(all_items) >= total:
            break
        page += 1
        time.sleep(0.2)

    RAW_FILE.parent.mkdir(parents=True, exist_ok=True)
    RAW_FILE.write_text(json.dumps(all_items, ensure_ascii=False), encoding="utf-8")
    print(f"\n저장 완료: {RAW_FILE} ({len(all_items)}건)")


if __name__ == "__main__":
    main()
