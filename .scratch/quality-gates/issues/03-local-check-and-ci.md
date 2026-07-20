# 03 — 接通本地验收入口和 GitHub CI

**要实现的内容：** 项目维护者可以用一条本地命令完成约定的工程验收；GitHub 在每次 push 和 pull request 时，自动在干净、依赖锁定的 Node.js 环境中重复该验收并执行生产构建。

**前置任务：** 01 — 建立非交互式源码检查；02 — 建立建筑数据校验边界

**状态：** complete

- [x] 聚合检查依次运行 ESLint、TypeScript、自动化测试和运行时数据校验；任一子命令失败时整体失败。
- [x] push 和 pull request 触发一个使用 Node 20 与已提交依赖锁文件的验证 job。
- [x] CI 使用 `npm ci` 安装依赖，随后运行聚合检查和生产构建。
- [x] CI 不部署、不使用项目 secrets、不采集或丰富数据，也不修改已提交文件。
- [x] 交付前，本地聚合检查与生产构建均通过。
- [x] 最终最小差异审查没有发现可避免的依赖、重复配置、推测性抽象或无关文件变更。
- [x] 锁文件修复提交关联的 GitHub `CI / verify` 通过。

## 验收证据

- `npm run check`：通过；ESLint 为 0 errors、6 个既有 warnings，TypeScript 通过，8 项测试通过，532 条运行时建筑记录通过校验。
- `npm run build`：通过；成功生成 537 个静态页面。
- `.github/workflows/ci.yml`：每次 push 和 pull request 使用 Node 20 运行 `npm ci`、`npm run check`、`npm run build`；只有 `contents: read` 权限。
- 首次 GitHub 运行在生产构建阶段暴露出 macOS 生成的锁文件缺少 Linux 原生可选包记录；修复提交仅补齐相同版本的 `@tailwindcss/oxide` 与 `lightningcss` Linux x64 锁定条目，没有改变直接依赖或验收命令。
- GitHub Actions 修复验证：[CI run 29745911450](https://github.com/sjqsgg/ShanxiMap/actions/runs/29745911450) 的 `verify` 在 Ubuntu / Node 20 上依次通过 `npm ci`、`npm run check` 与 `npm run build`。
