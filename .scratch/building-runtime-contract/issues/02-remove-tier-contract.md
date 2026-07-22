# 02 — 从运行时地点档案中删除访古等级

**要实现的内容：** 数据维护者获得不再包含主观价值等级的运行时地点档案；现有全部记录、领域声明和基础校验边界同步完成迁移，而页面行为保持上一阶段已经验收的中立状态。

**前置任务：** 01 — 移除访古等级对浏览体验的影响

**状态：** complete

- [x] 全部运行时地点档案删除 `tier`，除此之外不重排记录、不改写内容，也不顺便清理其他数据字段。
- [x] `Building` 领域声明、旧等级常量、统计派生和基础 validator 不再要求或表达访古等级。
- [x] 仓库中的运行时代码不再读取 `tier`，但历史文档中为解释迁移而保留的文字不被误当作代码遗留。
- [x] validator 的有效样本不再需要 `tier`，真实运行时 artifact 继续通过命令行数据校验。
- [x] 数据 diff 可被审核为单一、机械的字段删除；记录数量、ID、顺序和其他字段值保持不变。
- [x] 本地聚合检查与生产构建通过。

## 验收证据

- 运行时 artifact diff 为 `0 additions / 532 deletions`；迁移前后的记录数均为 532，ID 顺序一致，迁移前去掉 `tier` 的对象投影与迁移后完整对象逐值相等。
- ID 序列 SHA-256 在迁移前后均为 `9b3d41e17b195156ec039e56870562ee92281f2491fbb8a3b4deb51509f5357f`；非 tier 数据 SHA-256 均为 `83de65ab96f292df35c1bbdb6b0152b8f6a22323bc813a5e191aba3887bcbb8a`。
- validator TDD 先观察到 tier-free 有效样本被旧规则拒绝；移除旧规则后，聚焦 validator、筛选和索引测试共 10 项通过。
- `Building`、旧等级常量、基础 validator、运行时 artifact、enrichment 结果与报告分组均已迁移；旧 Python promotion 在写入 runtime 前显式丢弃 source 中可能存在的历史字段。
- `npm run check`：通过；ESLint 为 0 errors、6 个既有 warnings，TypeScript 通过，10 项测试通过，532 条运行时记录通过校验。
- `npm run build`：通过；成功生成 537 个静态页面。
- 双轴审查：Standards 与 Spec 均为 0 个可操作问题；严格未知字段拒绝明确留给工单 03。
