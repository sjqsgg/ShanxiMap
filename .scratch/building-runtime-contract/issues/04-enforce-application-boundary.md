# 04 — 在应用加载边界强制执行地点档案契约

**要实现的内容：** 访客页面只能接收到经过同一公共 validator 验证的地点档案；任何非法运行时数据都会阻止开发或生产构建，而不是被 TypeScript 断言悄悄放行。

**前置任务：** 03 — 完成严格的地点档案运行时校验

**状态：** complete

- [x] 应用加载运行时 JSON 时调用与命令行和测试相同的公共 validator，不再通过类型断言绕过校验。
- [x] 合法数据以 `Building[]` 供现有页面、筛选、地图和静态详情路由使用，不要求消费方重复校验。
- [x] 非法数据在应用边界抛出包含字段路径和问题摘要的稳定错误，并阻止生产构建。
- [x] 生产构建针对真实 artifact 成功生成现有页面；集成验证观察实际 validator 结果，不只检查导入或配置是否存在。
- [x] 数据事实文档和领域上下文反映完整契约已经由命令行、测试与应用共同执行，并记录宽松山西坐标边界及其局限。
- [x] 本阶段不重做数据管线、专题地图、移动端或实用信息版面，也不采集或纠正地点内容。
- [x] `npm run check` 与 `npm run build` 均通过，GitHub CI 在干净 Node 20 环境重复通过；既有 warning 如未相关修复则如实报告。

## 验收证据

- 应用边界测试先因 `loadBuildings` 不存在而失败；实现后，非法输入会按 validator 顺序抛出未知 `tier` 与缺失 `name` 的完整路径、ID 和摘要。
- `src/lib/data.ts` 已删除 `as unknown as Building[]`，真实 `BUILDINGS` 通过 `loadBuildings(raw)` 取得一次验证后的 `Building[]`。
- CLI 与应用共用 `validateBuildings` 和 `formatBuildingValidationIssue`；消费方未增加重复校验。
- `npm run check`：0 error，6 个既有 warning；28 项测试和 532 条真实 runtime 记录通过。
- `npm run build`：真实 artifact 经应用加载边界后生成全部 537 个静态页面。
- 双轴审查（固定点 `d578453`）：Standards 轴与 Spec 轴均为 0 项可行动问题。
- `src/data/buildings.json` 不在本 ticket diff 中；未改地图、移动端、管线结构、实用信息或地点内容。
