# Stale's Knowledge Base

基于 React + Vite + Tailwind CSS 构建的知识沉淀站点，用于展示多模态大模型相关的内容。

---

## 1. 环境要求

| 工具  | 最低版本      | 说明           |
|-------|---------------|----------------|
| Node.js | ≥ 18          | [下载地址](https://nodejs.org/) |
| npm     | ≥ 9（随 Node 自带） | 包管理器       |
| Git     | 任意版本      | 用于克隆仓库   |

验证安装：

```bash
node -v   # 应输出 v18.x 或更高
npm -v    # 应输出 9.x 或更高
```

---

## 2. 安装依赖

```bash
# 进入项目根目录
cd stale_web

# 安装所有依赖
npm install
```

---

## 3. 本地开发（仅本机访问）

```bash
npm run dev
```

启动后在浏览器打开 `http://localhost:5173` 即可访问。

---

## 4. 局域网内其他设备访问

项目已默认绑定 `0.0.0.0`（见 `vite.config.js`），因此同局域网内的其他设备可以直接通过本机 IP 访问。

### 4.1 查看本机局域网 IP

```bash
# macOS
ifconfig en0 | grep "inet " | awk '{print $2}'
```

假设输出为 `192.168.1.15`，其他设备在浏览器打开 `http://192.168.1.15:5173` 即可。

### 4.2 如果不通，排查以下项

1. **防火墙**：系统设置 → 网络 → 防火墙，确保未阻止传入连接，或临时关闭防火墙测试。
2. **同一网络**：确保两台设备连接的是同一个路由器/Wi-Fi。
3. **VPN**：关闭 VPN 再试。

---

## 5. 其他网络（公网）访问

`0.0.0.0` 绑定只对**同一局域网**生效。如果你希望公司内网其他网段、或外网设备也能访问，需要额外手段。

### 方案一：构建后部署到静态托管平台（推荐生产用）

```bash
# 构建产物在 dist/ 目录
npm run build
```

将 `dist/` 目录部署到任意静态托管服务，即可通过公网 URL 访问：

- [Vercel](https://vercel.com/)：免费，自动 HTTPS，`vercel` CLI 一键部署
- [Netlify](https://www.netlify.com/)：免费，支持拖拽上传
- [GitHub Pages](https://pages.github.com/)：免费，适合开源项目

### 方案二：内网穿透（快速临时分享）

使用隧道工具将本地的 `5173` 端口暴露到公网，生成一个临时 URL，任何网络均可访问：

#### ngrok（最简单）

```bash
# 安装 ngrok（首次需要注册免费账号）
brew install ngrok   # macOS

# 认证（只需一次）
ngrok config add-authtoken <你的token>

# 暴露本地 5173 端口
ngrok http 5173
```

终端会输出一个 `https://xxx.ngrok-free.app` 的公网地址，发给任何人即可访问。

#### Cloudflare Tunnel（免费，无需安装额外客户端）

```bash
# 安装 cloudflared
brew install cloudflared

# 启动隧道
cloudflared tunnel --url http://localhost:5173
```

同样会生成一个 `https://xxx.trycloudflare.com` 的临时地址。

#### localtunnel（零配置）

```bash
npx localtunnel --port 5173
```

会生成 `https://xxx.loca.lt` 地址，首次访问需要输入你的公网 IP 验证。

### 方案三：路由器端口转发（需要路由器管理权限）

如果你有公网 IP，可以在路由器上配置端口转发，将外网的某个端口映射到本机 `192.168.1.15:5173`。这种方式受运营商 NAT 和防火墙限制，不推荐新手操作。

---

## 6. 预览生产构建

```bash
npm run build
npm run preview
```

在浏览器打开终端提示的地址（默认 `http://localhost:4173`）即可预览构建后的效果。

---

## 7. 项目结构

```
stale_web/
├── index.html              # HTML 入口
├── vite.config.js          # Vite 配置
├── package.json            # 依赖与脚本
├── logo.svg                # 站点 Logo
├── public/
│   └── images/             # 静态图片资源
└── src/
    ├── main.jsx            # React 入口
    ├── App.jsx             # 根组件（路由、布局）
    ├── index.css           # 全局样式（Tailwind + 自定义）
    ├── data/
    │   └── content.js      # 知识库数据
    └── components/         # UI 组件
        ├── CategoryCard.jsx
        ├── CollapsibleTOC.jsx
        ├── EditableText.jsx
        ├── FeishuEditor.jsx
        ├── FormatToolbar.jsx
        ├── ImageLightbox.jsx
        ├── ScrollProgress.jsx
        └── SlashMenu.jsx
```

---

## 8. 常用命令速查

| 命令               | 作用               |
|--------------------|--------------------|
| `npm install`      | 安装依赖           |
| `npm run dev`      | 启动开发服务器     |
| `npm run build`    | 构建生产包         |
| `npm run preview`  | 本地预览生产包     |
