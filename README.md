# Floria-MapCard

Floria 工作区预览卡片 · 缩略图：同源 `iframe` 内嵌真实 Floria web 前端的离线演示页（`?demo=1`），按组件树逐级展开、点选后高亮其在真实界面中的位置，并展示拟造的虚拟使用情景；每个组件名可作为 `@` 元素插入输入栏。

## 安装

把本仓库文件放进目标项目的预览卡目录：

```
<项目根>/.claude/preview/floria-map/
├─ index.html
├─ style.css
├─ data.js     # 唯一维护点：组件点分名 / mode / sel / setup / 演示对话
├─ app.js
└─ card.json   # elements[] = 可 @ 的组件名
```

卡在网关静态托管下打开：`/preview/<项目 label>/floria-map/`。

## 依赖

卡片内嵌的 `iframe` 指向 `/session/demo-1?demo=1`，需要宿主 Floria 的 web 前端支持 `?demo=1` 离线演示模式：

- `web/demo-data.js` 提供演示会话 / 项目 / 模型 / 插件静态数据；
- `web/demo-mode.js` 拦截 `/gateway/*` 的 `fetch`，`EventSource` / `WebSocket` 置空，存储换内存实现；
- `/gateway/health` 回 `mode:'demo'` ⇒ 前端不建网关连接、不设 token 门。

首个包含该模式的构建：`cli-dev-20261114200118.exe`（Pj16-FloriaAgent）。

## 交互

- 默认只露 `Floria` 直属子级；点父级行展开下一级，组件按层级落在 6 列网格的对应列。
- 点组件行 → 切到该组件所在模式（chat / work）并执行必要的开层动作（开菜单、切文件页签、打开预览等）→ 读 `iframe` 内真实元素 `getBoundingClientRect()` 画高亮框，布局改动无需改卡。
- 容器宽度变化时缩放与高亮框同步重算；窄卡片下预览贴顶、组件树紧随其后。

## 卡片公开 API

命名空间 `floria-map-pv`，人机共用同一条 `select()` 处理链：

| 命令 | 参数 | 说明 |
| --- | --- | --- |
| `state` | — | 当前模式、选中组件、组件总数、缩放比、可用区尺寸 |
| `locate` | — | 当前高亮框（缩放后坐标） |
| `open` | `{id}` | 选中并高亮组件 |
| `close` | — | 清除高亮 |
| `mode` | `{mode:'chat'\|'work'}` | 切缩略图模式 |
| `list` | — | 全部组件 id / 名称 / 模式 |
| `scroll` | `{index}` | 滚动组件树到第 N 项 |

## 组件覆盖

`data.js` 与 `card.json` 的 `elements[]` 逐条对应，当前 44 条，覆盖 `Floria` 组件树（Sidebar / ChatCard / WorkSpace / ToolCapsule / CenterPop / Overlays 及其子级）。预览卡、预览帧、帧内工具在演示项目无预览页的前提下不会显形，故不列入。
