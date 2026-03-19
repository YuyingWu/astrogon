# 本地开发指南

## 前置条件

- Node.js 22+（推荐通过 [nvm](https://github.com/nvm-sh/nvm) 或 [nvm-windows](https://github.com/coreybutler/nvm-windows) 管理）
- npm 10+

```bash
npm install
```

## 常用命令

| 命令                           | 说明                                                       |
| ------------------------------ | ---------------------------------------------------------- |
| `npm run dev`                  | Astro 开发服务器（热更新，不含 Cloudflare Workers）        |
| `npm run build`                | 生产构建，输出到 `dist/`，构建后自动运行 pagefind 索引     |
| `npx wrangler dev --port 4321` | 基于 Wrangler 启动本地服务器，模拟 Cloudflare Workers 环境 |
| `npm run format`               | Prettier 格式化 `src/`                                     |

## 本地调试 Decap CMS Admin

线上环境 `/admin/` 通过 GitHub OAuth 认证，本地调试需要绕过这个流程。Decap 提供了 `local_backend` 模式，通过本地 Git 代理直接读写文件。

### 步骤

**1. 在 `public/admin/config.yml` 顶部添加一行：**

```yaml
local_backend: true

backend:
  name: github
  # ... 其余配置不变
```

**2. 构建站点：**

```bash
npm run build
```

**3. 启动两个服务（两个终端窗口）：**

```bash
# 终端 1：Wrangler 本地服务器（端口 4321）
npx wrangler dev --port 4321

# 终端 2：Decap 本地 Git 代理（端口 8081）
npx decap-server
```

> `decap-server` 是 `decap-cms` 自带的本地代理，会在 8081 端口启动一个 API 服务，直接读写当前 Git 仓库的文件，无需 GitHub 认证。

**4. 访问 CMS：**

浏览器打开 `http://localhost:4321/admin/`，点击 Login 即可进入，不会弹出 GitHub 授权。

### 注意事项

- `local_backend: true` 仅用于本地调试，**不要提交到仓库**
- `decap-server` 直接操作本地文件，编辑保存后会直接修改 `src/content/` 下的 markdown 文件
- 修改 `public/admin/` 下的文件（CSS、JS、config.yml）后需要重新 `npm run build`，Wrangler 从 `dist/` 目录提供静态文件
- 如果只修改 `src/` 下的内容文件，使用 `npm run dev`（Astro 开发服务器）即可热更新，不需要 Wrangler

### 手机端调试

调试 Admin 的移动端布局时，在浏览器 DevTools 中切换设备模拟器（F12 → 点击手机图标 → 选择 iPhone 14 等设备），移动端适配的 CSS 和 JS 文件：

- `public/admin/mobile.css` — 移动端响应式样式覆盖（`@media` 断点 768px）
- `public/admin/mobile-layout.js` — 汉堡菜单抽屉交互

## 项目结构

```
public/admin/
├── config.yml            # Decap CMS 配置（集合定义、后端、媒体库）
├── index.html            # CMS 入口页
├── oss-media-library.js  # 阿里云 OSS 自定义媒体库
├── mobile.css            # 移动端响应式样式
└── mobile-layout.js      # 移动端侧边栏抽屉交互

src/content/              # 内容集合（Decap 编辑的就是这些文件）
├── blog/                 # 博客
├── docs/                 # 文档
├── gallery/              # 图集
└── recipes/              # 菜谱

dist/                     # 构建输出（Wrangler 从此目录提供服务）
```

## 部署

站点部署在 Cloudflare Workers 上。推送到 `main` 分支后自动触发部署。

构建命令：`npm run build`，输出目录：`dist/`。
