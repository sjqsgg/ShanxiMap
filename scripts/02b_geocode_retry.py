# -*- coding: utf-8 -*-
"""对 geo_precision 为 county/approx 的记录用高德POI文本搜索重试（可校验返回名称），
并处理旧区县名与别名。"""
import json, time, csv, re, urllib.request, urllib.parse

import os, sys
ROOT = "/Users/a77/Downloads/ShanxiMap"
KEY = os.environ.get("AMAP_WEB_KEY", "")
if not KEY:
    sys.exit("请先设置环境变量 AMAP_WEB_KEY（高德Web服务key）")

# 旧区县名 -> 现名
COUNTY_FIX = {
    "临汾县": "尧都区", "榆次市": "榆次区", "离石市": "离石区",
    "长治县": "上党区", "潞城市": "潞城区", "朔县": "朔城区",
    "南郊区": "云冈区", "城区": "", "郊区": "",
}
ALIAS = {
    "千佛庵": "小西天", "袄神楼": "祆神楼", "则天庙": "则天圣母庙",
}

def norm_county(c):
    c = (c or "").replace("等", "")
    if "、" in c: c = c.split("、")[0]
    return COUNTY_FIX.get(c, c)

def clean_name(n):
    return re.sub(r"[（(].*?[)）]", "", n).strip()

def poi_search(kw, city):
    url = "https://restapi.amap.com/v3/place/text?" + urllib.parse.urlencode(
        {"keywords": kw, "city": city, "citylimit": "true", "key": KEY, "offset": 5})
    for _ in range(3):
        try:
            with urllib.request.urlopen(url, timeout=10) as r:
                res = json.load(r)
            if res.get("status") == "1":
                return res.get("pois", [])
            if res.get("infocode") == "10021":
                time.sleep(1.2); continue
            return []
        except Exception:
            time.sleep(1.0)
    return []

def name_match(query, poi_name):
    q = clean_name(query)
    return q in poi_name or poi_name in q or (len(q) >= 4 and q[:4] in poi_name)

def main():
    data = json.load(open(f"{ROOT}/data_work.json", encoding="utf-8"))
    todo = [d for d in data if d.get("geo_precision") in ("county", "approx")]
    print(f"重试 {len(todo)} 条")
    upgraded = 0
    for i, d in enumerate(todo):
        name = ALIAS.get(d["name"], d["name"])
        county = norm_county(d["county"])
        kws = [clean_name(name)]
        inner = re.findall(r"[（(](.*?)[)）]", d["name"])
        kws += [x.replace("等", "").split("、")[0] for x in inner if x]
        best = None
        for kw in kws:
            for p in poi_search(kw, d["city"]):
                pname, adname = p.get("name", ""), p.get("adname", "")
                if not name_match(kw, pname):
                    continue
                county_ok = (not county) or (county in adname) or (adname in county)
                loc = p.get("location")
                if not loc or not isinstance(loc, str):
                    continue
                lng, lat = map(float, loc.split(","))
                cand = (lat, lng, "high" if county_ok else "approx", pname, adname)
                if county_ok:
                    best = cand; break
                best = best or cand
            time.sleep(0.35)
            if best and best[2] == "high":
                break
        if best and (best[2] == "high" or d["geo_precision"] == "county"):
            old = d["geo_precision"]
            d["lat"], d["lng"], d["geo_precision"] = best[0], best[1], best[2]
            d["geo_source"] = f"amap-poi:{best[3]}"
            if best[2] != old:
                upgraded += 1
        if (i + 1) % 40 == 0:
            print(f"  {i+1}/{len(todo)}", flush=True)

    json.dump(data, open(f"{ROOT}/data_work.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    from collections import Counter
    cnt = Counter(d.get("geo_precision") for d in data)
    print("升级", upgraded, "条；精度分布:", cnt)
    with open(f"{ROOT}/geo_review.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["id", "名称", "地市", "区县", "级别", "来源"])
        for d in data:
            if d.get("geo_precision") != "high":
                w.writerow([d["id"], d["name"], d["city"], d["county"],
                            d.get("geo_precision"), d.get("geo_source", "")])

if __name__ == "__main__":
    main()
