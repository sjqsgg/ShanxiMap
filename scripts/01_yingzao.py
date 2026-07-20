# -*- coding: utf-8 -*-
"""营造学社字段写入：仅标注下方文献清单确认的建筑（按 id 精确匹配）。"""
import csv, json, io

ROOT = "/Users/a77/Downloads/ShanxiMap"

# id -> (营造学社, 来源)
YINGZAO = {
    9:   ("详测", "《大同古建筑调查报告》1933"),      # 华严寺
    8:   ("详测", "《大同古建筑调查报告》1933"),      # 善化寺
    3:   ("详测", "《云冈石窟中所表现的北魏建筑》1933"),  # 云冈石窟
    84:  ("详测", "《晋汾古建筑预查纪略》1935"),      # 太符观
    233: ("详测", "《晋汾古建筑预查纪略》1935"),      # 文峰塔(汾阳)
    68:  ("详测", "《晋汾古建筑预查纪略》1935"),      # 介休后土庙
    81:  ("详测", "《晋汾古建筑预查纪略》1935"),      # 平遥文庙
    11:  ("详测", "《晋汾古建筑预查纪略》1935"),      # 广胜寺
    7:   ("详测", "《晋汾古建筑预查纪略》1935"),      # 晋祠
    44:  ("详测", "《晋汾古建筑预查纪略》1935"),      # 则天庙(文水圣母庙)
    87:  ("详测", "《晋汾古建筑预查纪略》1935"),      # 资寿寺
    6:   ("详测", "《记五台山佛光寺的建筑》1944"),     # 佛光寺
    4:   ("到访", "测绘记录（报告未发表）"),           # 应县木塔
    436: ("到访", "行程照片记录"),                    # 大同观音堂
    17:  ("到访", "行程照片记录"),                    # 悬空寺
    100: ("到访", "行程照片记录"),                    # 浑源永安寺
}

# CSV
with open(f"{ROOT}/shanxi_guobao_enhanced.csv", encoding="utf-8-sig") as f:
    rows = list(csv.DictReader(f))
for r in rows:
    yz, src = YINGZAO.get(int(r["序号"]), ("", ""))
    r["营造学社"], r["营造学社来源"] = yz, src

fields = list(rows[0].keys())
with open(f"{ROOT}/shanxi_guobao_final.csv", "w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader(); w.writerows(rows)

with open(f"{ROOT}/yingzao_list.csv", "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["序号", "名称", "地市", "朝代", "营造学社", "营造学社来源"])
    for r in rows:
        if r["营造学社"]:
            w.writerow([r["序号"], r["名称"], r["地市"], r["朝代"], r["营造学社"], r["营造学社来源"]])

# JSON
with open(f"{ROOT}/shanxi_guobao_enhanced.json", encoding="utf-8") as f:
    data = json.load(f)
for d in data:
    yz, src = YINGZAO.get(d["id"], ("", ""))
    d["yingzao"], d["yingzao_source"] = yz, src
with open(f"{ROOT}/data_work.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)

marked = [(d["id"], d["name"], d["yingzao"]) for d in data if d["yingzao"]]
print(f"标注 {len(marked)} 条：")
for m in marked: print(" ", m)
