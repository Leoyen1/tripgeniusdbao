# TripGenius GitHub部署到EdgeOne Pages指南

## 🚀 概述

本指南将帮助您通过GitHub将TripGenius应用自动部署到腾讯云EdgeOne Pages。

## 📋 部署前准备

### 1. 腾讯云账号配置
- 登录[腾讯云控制台](https://console.cloud.tencent.com)
- 确保已开通EdgeOne服务
- 获取以下信息：
  - **SecretId**: 腾讯云API密钥ID
  - **SecretKey**: 腾讯云API密钥Key
  - **Zone ID**: EdgeOne加速域名ID
  - **Pages Project ID**: EdgeOne Pages项目ID

### 2. GitHub仓库设置
- 将代码推送到GitHub仓库
- 在仓库Settings → Secrets and variables → Actions中配置以下secrets：

```
TENCENT_CLOUD_SECRET_ID: 您的腾讯云SecretId
TENCENT_CLOUD_SECRET_KEY: 您的腾讯云SecretKey
EDGEONE_ZONE_ID: 您的EdgeOne Zone ID
EDGEONE_PAGES_PROJECT_ID: 您的EdgeOne Pages项目ID
```

## 🔧 GitHub Actions工作流

### 自动触发条件
- 推送到 `main` 或 `master` 分支
- 创建Pull Request到 `main` 或 `master` 分支

### 工作流步骤
1. **代码检出** - 从GitHub仓库拉取代码
2. **Node.js环境设置** - 配置Node.js 18环境
3. **依赖安装** - 使用`npm ci`安装依赖
4. **代码检查** - 运行lint和typecheck（如果配置）
5. **项目构建** - 运行`npm run build`
6. **部署到EdgeOne** - 使用腾讯云官方Action部署

## ⚙️ EdgeOne Pages配置

### 环境变量设置
在EdgeOne Pages控制台中设置：

```env
API_KEY=您的火山引擎API密钥
DOUBAO_MODEL_ID=Doubao-Seed-1.6-flash
```

### 边缘函数配置
- 路径：`/edgeone/chat`
- 函数文件：`edgeone/chat.js`

## 📁 项目文件结构

```
tripgeniusdbao/
├── .github/workflows/          # GitHub Actions配置
│   └── deploy-edgeone.yml     # 部署工作流
├── dist/                       # 构建输出（自动生成）
├── edgeone/                    # EdgeOne边缘函数
│   └── chat.js
├── components/                 # React组件
├── services/                   # 业务服务
├── views/                      # 页面视图
├── public/                     # 静态资源
├── package.json               # 项目配置
├── vite.config.ts             # 构建配置
└── GITHUB_DEPLOYMENT.md       # 本指南
```

## 🚀 部署流程

### 第一步：准备GitHub仓库

1. 在GitHub创建新仓库
2. 将本地代码推送到GitHub：

```bash
git init
git add .
git commit -m "feat: initial commit for TripGenius"
git branch -M main
git remote add origin https://github.com/您的用户名/tripgeniusdbao.git
git push -u origin main
```

### 第二步：配置GitHub Secrets

在GitHub仓库中：
1. 进入 Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下4个secrets：

| Secret名称 | 描述 | 获取方式 |
|-----------|------|----------|
| `TENCENT_CLOUD_SECRET_ID` | 腾讯云API密钥ID | 腾讯云控制台 → 访问管理 → API密钥管理 |
| `TENCENT_CLOUD_SECRET_KEY` | 腾讯云API密钥Key | 同上 |
| `EDGEONE_ZONE_ID` | EdgeOne加速域名ID | EdgeOne控制台 → 域名详情 → 基本信息 |
| `EDGEONE_PAGES_PROJECT_ID` | EdgeOne Pages项目ID | EdgeOne Pages项目详情页 |

### 第三步：触发自动部署

1. 代码推送到main分支后，GitHub Actions会自动运行
2. 在GitHub仓库的"Actions"标签页查看部署状态
3. 部署完成后，在EdgeOne Pages控制台获取访问链接

## 🔒 安全配置

### API密钥保护
- ✅ GitHub Secrets加密存储
- ✅ EdgeOne环境变量加密
- ✅ 代码中无硬编码密钥

### 访问控制
- 建议设置分支保护规则
- 要求Pull Request审查
- 启用状态检查

## 🛠️ 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 本地测试构建
   npm run build
   ```

2. **部署失败**
   - 检查GitHub Secrets配置是否正确
   - 确认腾讯云账号有足够权限

3. **API调用失败**
   - 验证EdgeOne环境变量设置
   - 检查边缘函数路径配置

### 调试建议

1. **本地测试**
   ```bash
   npm install
   npm run build
   npm run dev
   ```

2. **GitHub Actions日志**
   - 查看Actions运行详细日志
   - 检查每一步的执行状态

3. **EdgeOne控制台**
   - 查看部署状态
   - 检查边缘函数日志

## 🔄 持续集成/持续部署(CI/CD)

### 开发流程
1. 在feature分支开发新功能
2. 创建Pull Request到main分支
3. GitHub Actions自动运行测试和构建
4. 代码审查通过后合并
5. 自动部署到EdgeOne Pages

### 环境管理
- **main分支**: 生产环境
- **develop分支**: 开发环境（可选）
- **feature/*分支**: 功能开发

## 📊 监控和日志

### GitHub Actions监控
- 部署状态通知
- 构建失败告警
- 性能指标监控

### EdgeOne监控
- 访问日志
- 错误率监控
- 性能分析

## 🎯 最佳实践

### 代码质量
- 启用ESLint和Prettier
- 配置TypeScript严格模式
- 添加单元测试

### 部署优化
- 使用缓存加速构建
- 配置CDN缓存策略
- 启用Gzip压缩

### 安全实践
- 定期轮换API密钥
- 启用双因素认证
- 监控异常访问

---

## 📞 技术支持

如有问题，请检查：
1. GitHub Actions运行日志
2. EdgeOne Pages部署状态
3. 浏览器开发者工具网络请求

**部署状态**: ✅ 已配置GitHub Actions
**自动化等级**: 🤖 完全自动化
**安全等级**: 🔒 企业级