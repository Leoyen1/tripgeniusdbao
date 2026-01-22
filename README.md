# TripGenius (Doubao AI 版)

这是一个基于 AI 大数据的个性化旅行规划助手，专为中国大陆网络环境优化，使用火山引擎（豆包模型）作为推理核心。

## 核心技术栈
- **前端**: React 19 + Vite + TailwindCSS
- **后端**: Tencent EdgeOne Pages Functions (自动路由)
- **AI 模型**: Doubao-Seed-1.6-flash
- **地图/天气**: Open-Meteo API

## 🔗 快速入口

- **前端托管 (Pages)**: [点击跳转 Pages 控制台](https://console.cloud.tencent.com/edgeone/pages)

---

## 🚀 部署指南 (最新简化版)

根据腾讯云客服建议，我们采用了 **目录结构自动路由** 方式，这比之前的手动配置触发器要简单得多。

### 步骤 1：确认代码结构
确保您的项目中包含 `edge-functions` 文件夹，且里面有 `api/chat.js`。
> 本项目已预置此结构：`/edge-functions/api/chat.js`

### 步骤 2：部署前端 (Pages)
1. 点击上面的 **Pages 控制台** 链接。
2. 新建项目，连接 GitHub `trip-genius` 仓库。
3. **关键配置**：在 Pages 项目的 **"设置" (Settings)** -> **"环境变量"** 中配置：
   - `API_KEY`: 您的火山引擎 Key
   - `DOUBAO_MODEL_ID`: 您的接入点 ID
4. 点击 **"保存并部署"** (或者重新部署)。

### 步骤 3：自动生效
EdgeOne Pages 会自动识别 `edge-functions` 目录，并将其映射为后端 API。
- 文件 `edge-functions/api/chat.js` 会自动对应 URL `https://您的域名/api/chat`。
- **无需手动创建函数！**
- **无需手动配置触发器！**

### 步骤 4：验证
访问 `https://trip.pandaou.cloud` (您的域名)，点击生成行程。
如果依然报错，请检查 Pages 控制台的部署日志，确认 Edge Functions 是否部署成功。

---

## 本地开发

1. 创建 `.env` 文件：
   ```env
   API_KEY=sk-xxxx...
   DOUBAO_MODEL_ID=ep-xxxx...
   ```
2. 启动模拟后端:
   ```bash
   npm run server
   ```
3. 启动前端:
   ```bash
   npm run dev
   ```
