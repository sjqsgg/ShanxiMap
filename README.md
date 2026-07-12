# 山西访古档案

山西省古建筑访古地图。532 处全国重点文物保护单位（第一至八批）按「档案」方式归档：
档案馆滚动叙事首页 + 全屏高德访古地图。为深入山西的访古旅行者而作，不蹭任何 IP。

## 功能

- **首页 `/`**：档案封面 → 21 张「必去」卷宗滚动滑出 → 磨砂过渡进入地图
- **地图 `/map`**：纸色底图，必去/推荐/小众三级点位，营造学社「测」字徽记，
  档案卡弹窗（简介、批次、坐标复制、高德导航），朝代/地市/等级/类型/营造学社筛选，
  搜索与列表联动；URL 携带筛选与选中状态，可直接分享（如 `/map?id=6`）
- **营造学社专题**：16 处梁思成/林徽因考察建筑，标注仅依据一手文献
  （《大同古建筑调查报告》1933、《云冈石窟中所表现的北魏建筑》1933、
  《晋汾古建筑预查纪略》1935、《记五台山佛光寺的建筑》1944 等）

## 本地开发

```bash
cp .env.example .env.local   # 填入高德 Web端(JS API) key 与安全密钥
npm install
npm run dev
```

## 部署（Vercel）

1. 推送本仓库到 GitHub，Vercel 导入
2. 环境变量：`NEXT_PUBLIC_AMAP_KEY`、`NEXT_PUBLIC_AMAP_SECRET`
3. **上线后务必**在高德控制台给 JS API key 配置域名白名单（key 会随前端代码公开）

## 数据

- `src/data/buildings.json`：前端唯一数据源（= `shanxi_guobao_final.json`）
- 坐标系 GCJ-02；精度 `geo_precision`: high 449 / approx 51 / county 32
- `geo_review.csv`：待人工精化的坐标清单
- 简介：必去+推荐 70 条手写（`desc_source: manual`），其余模板生成（`template`），
  可增量补写后重跑 `scripts/03_descriptions.py`
- 数据管线：`scripts/01_yingzao.py` → `02_geocode.py`（需 `AMAP_WEB_KEY` 环境变量）
  → `02b_geocode_retry.py` → `03_descriptions.py`

## 技术栈

Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + 高德 JS API 2.0。
纯静态构建，零后端；社区/账号/数据库可后续以 API Routes + 数据库直接扩展。
