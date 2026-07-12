# -*- coding: utf-8 -*-
"""坐标管线：28个已知WGS-84坐标转GCJ-02填入；其余用高德Web服务API批量编码。
消歧：返回结果的district与数据区县比对；置信度 high/approx/county 三档。
"""
import json, math, time, csv, sys, urllib.request, urllib.parse

import os
ROOT = "/Users/a77/Downloads/ShanxiMap"
KEY = os.environ.get("AMAP_WEB_KEY", "")
if not KEY:
    sys.exit("请先设置环境变量 AMAP_WEB_KEY（高德Web服务key）")

# ---------- WGS-84 -> GCJ-02 ----------
A = 6378245.0
EE = 0.00669342162296594323

def _tlat(x, y):
    r = -100.0 + 2.0*x + 3.0*y + 0.2*y*y + 0.1*x*y + 0.2*math.sqrt(abs(x))
    r += (20.0*math.sin(6.0*x*math.pi) + 20.0*math.sin(2.0*x*math.pi)) * 2.0/3.0
    r += (20.0*math.sin(y*math.pi) + 40.0*math.sin(y/3.0*math.pi)) * 2.0/3.0
    r += (160.0*math.sin(y/12.0*math.pi) + 320*math.sin(y*math.pi/30.0)) * 2.0/3.0
    return r

def _tlng(x, y):
    r = 300.0 + x + 2.0*y + 0.1*x*x + 0.1*x*y + 0.1*math.sqrt(abs(x))
    r += (20.0*math.sin(6.0*x*math.pi) + 20.0*math.sin(2.0*x*math.pi)) * 2.0/3.0
    r += (20.0*math.sin(x*math.pi) + 40.0*math.sin(x/3.0*math.pi)) * 2.0/3.0
    r += (150.0*math.sin(x/12.0*math.pi) + 300.0*math.sin(x/30.0*math.pi)) * 2.0/3.0
    return r

def wgs2gcj(lat, lng):
    dlat, dlng = _tlat(lng-105.0, lat-35.0), _tlng(lng-105.0, lat-35.0)
    rlat = lat/180.0*math.pi
    magic = 1 - EE*math.sin(rlat)**2
    sq = math.sqrt(magic)
    dlat = (dlat*180.0) / ((A*(1-EE))/(magic*sq)*math.pi)
    dlng = (dlng*180.0) / (A/sq*math.cos(rlat)*math.pi)
    return round(lat+dlat, 6), round(lng+dlng, 6)

KNOWN_WGS = {  # name -> (lat, lng) WGS-84
    "佛光寺": (38.8692, 113.3878), "南禅寺大殿": (38.7242, 113.1261),
    "佛宫寺释迦塔（应县木塔）": (39.5644, 113.1783), "永乐宫": (34.7219, 110.6956),
    "悬空寺": (39.6696, 113.7286), "晋祠": (37.7081, 112.4344),
    "云冈石窟": (40.1097, 113.1358), "天台庵": (36.3831, 113.3986),
    "广仁王庙": (34.7086, 110.6344), "乔家大院": (37.2767, 112.3372),
    "双林寺": (37.1683, 111.9922), "镇国寺": (37.2217, 112.1578),
    "华严寺": (40.0906, 113.2844), "善化寺": (40.0811, 113.2956),
    "崇福寺": (39.3306, 112.4328), "平遥城墙": (37.1894, 112.1750),
    "广胜寺": (36.2803, 111.5469), "天龙山石窟": (37.7250, 112.3694),
    "龙门寺": (36.3408, 113.5681), "大云院": (36.3314, 113.5453),
    "姬氏民居": (35.8658, 113.0633), "岩山寺": (39.1456, 113.5211),
    "解州关帝庙": (35.0092, 110.8614), "王家大院": (36.8467, 111.7822),
    "玉皇庙": (35.4769, 112.8267), "法兴寺": (36.0981, 112.8836),
    "青莲寺": (35.5117, 112.9019), "崇庆寺": (36.0897, 112.8653),
}

POI_LEVELS = {"兴趣点", "热点商圈"}
MID_LEVELS = {"村庄", "乡镇", "道路", "门牌号", "单元号", "道路交叉路口", "公交站台、地铁站"}

def geocode(address, city):
    url = "https://restapi.amap.com/v3/geocode/geo?" + urllib.parse.urlencode(
        {"address": address, "city": city, "key": KEY})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=10) as r:
                res = json.load(r)
            if res.get("status") == "1":
                return res.get("geocodes", [])
            if res.get("infocode") == "10021":  # QPS limit
                time.sleep(1.2); continue
            return []
        except Exception:
            time.sleep(1.0)
    return []

def pick(geos, county, city):
    """返回 (lat,lng,precision) 或 None。district/city 一致性消歧。"""
    for g in geos:
        dist = g.get("district") or ""
        gc = g.get("city") or ""
        dist = dist if isinstance(dist, str) else ""
        gc = gc if isinstance(gc, str) else ""
        area_ok = (county and county in dist) or (not county and city and city in gc)
        if not area_ok:
            continue
        lvl = g.get("level", "")
        lng, lat = map(float, g["location"].split(","))
        if lvl in POI_LEVELS:
            return lat, lng, "high"
        if lvl in MID_LEVELS:
            return lat, lng, "approx"
    return None

def main():
    data = json.load(open(f"{ROOT}/data_work.json", encoding="utf-8"))
    # 1) 已知坐标
    for d in data:
        if d["name"] in KNOWN_WGS:
            lat, lng = wgs2gcj(*KNOWN_WGS[d["name"]])
            d["lat"], d["lng"], d["geo_precision"] = lat, lng, "high"
            d["geo_source"] = "manual"
    # 2) 批量编码
    county_cache = {}
    review = []
    todo = [d for d in data if d.get("lat") is None]
    print(f"待编码 {len(todo)} 条")
    for i, d in enumerate(todo):
        name, county, city, addr = d["name"], d["county"] or "", d["city"], d["address"]
        q1 = f"山西省{city}{county}{name}"
        got = pick(geocode(q1, city), county, city)
        time.sleep(0.35)
        if not got:
            q2 = f"{addr}{name}" if name not in addr else addr
            got = pick(geocode(q2, city), county, city)
            time.sleep(0.35)
        if got:
            d["lat"], d["lng"], d["geo_precision"] = got[0], got[1], got[2]
            d["geo_source"] = "amap"
            if got[2] != "high":
                review.append((d["id"], name, city, county, "approx"))
        else:
            # 区县中心兜底
            ckey = f"{city}|{county}"
            if ckey not in county_cache:
                cg = geocode(f"山西省{city}{county}" if county else f"山西省{city}", city)
                time.sleep(0.35)
                county_cache[ckey] = None
                for g in cg:
                    lng, lat = map(float, g["location"].split(","))
                    county_cache[ckey] = (lat, lng); break
            if county_cache[ckey]:
                d["lat"], d["lng"] = county_cache[ckey]
                d["geo_precision"], d["geo_source"] = "county", "county-centroid"
            review.append((d["id"], name, city, county, "county"))
        if (i+1) % 50 == 0:
            print(f"  {i+1}/{len(todo)} 完成", flush=True)

    json.dump(data, open(f"{ROOT}/data_work.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    with open(f"{ROOT}/geo_review.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["id", "名称", "地市", "区县", "级别"])
        w.writerows(review)
    from collections import Counter
    print("精度分布:", Counter(d.get("geo_precision") for d in data))
    print(f"人工核查清单 {len(review)} 条 -> geo_review.csv")

if __name__ == "__main__":
    main()
