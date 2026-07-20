# 山西访古档案

山西省全国重点文物保护单位的静态访古地图。项目以“国保档案馆”为视觉与信息隐喻：用户在首页下滑展开主要地图体验，也可进入独立全屏地图，并查看 532 个地点档案详情页。

## 当前功能

- `/`：主要体验；档案主题介绍之后，下滑展开地图探索器和地市索引。
- `/map`：同一地图探索器的直达模式，为回访、实地使用和分享筛选链接提供全屏入口。
- `/site/[id]`：地点档案详情、图片与来源、实用信息、高德导航跳转、附近古建，以及尚未启用的公开评论、打卡和收藏入口。

地图探索器用于发现、筛选、定位和查看地点档案，不提供路线规划；需要导航时跳转高德地图。

当前数据包括 532 个唯一档案及坐标；简介来源为 70 条 manual、379 条 wiki、83 条 template。更完整的数据字段和覆盖情况见 [`docs/data/dictionary.md`](docs/data/dictionary.md)。

## 本地开发

```bash
cp .env.example .env.local
npm install
npm run dev
```

`.env.local` 需要填写高德 Web 端 JS API key 与安全密钥。生产域名应在高德控制台配置白名单。

验证当前生产构建：

```bash
npx tsc --noEmit
npm run build
```

`npm run lint` 目前仍是失效的 `next lint` 脚本，尚不能作为验证命令。

## 项目文档

- [`AGENTS.md`](AGENTS.md)：代理和贡献工作规则。
- [`CONTEXT.md`](CONTEXT.md)：产品、数据和工程术语。
- [`docs/product/product.md`](docs/product/product.md)：产品目标、原则和非目标。
- [`docs/architecture/current-system.md`](docs/architecture/current-system.md)：当前架构及已确认风险。
- [`docs/data/dictionary.md`](docs/data/dictionary.md)：前端运行时数据字典。
- [`docs/data/pipeline.md`](docs/data/pipeline.md)：现有数据流水线与产物分类。
- [`docs/workflow.md`](docs/workflow.md)：规格、任务切片、实现和审核流程。
- [`docs/adr/`](docs/adr/)：长期决策记录。

## 技术栈

Next.js 15 App Router、React 19、TypeScript、Tailwind CSS 4、Framer Motion、高德 JS API 2.0。应用当前为静态构建，无后端和数据库。
