# RideVista - 你的个人骑行数据中心

这是一个99%的代码借助Bolt.new + windsurft + claude 生成的项目，热力图UI借鉴了 [city-roads](https://github.com/anvaka/city-roads) ，非常感谢 anvaka！

一个现代化的 Web 应用，集成 Strava 来可视化和分析你的骑行活动, 生成好看的年度骑行热力图。使用 Next.js 16 构建，具有精美的界面和全面的统计数据。

[English](./README.md) | 简体中文

![image](https://github.com/user-attachments/assets/ac189e33-0eaa-481f-85c9-c2d36eab3694)

## 功能特点

- 🔄 Strava 集成
- 📊 详细的活动统计
- 🗺️ 活动路线地图
- 🌐 OpenStreetMap 集成，实现快速地图可视化
- 📱 响应式设计
- 🌓 深色/浅色模式
- 🌍 国际化支持（英文/中文/西班牙语）
- 📱 PWA 支持（可安装应用）
- ⚡ 智能缓存系统
  - Next.js 服务器端缓存（5分钟重新验证）
  - SWR 客户端缓存，避免触及 Strava API 速率限制

## 技术栈

- Next.js 16
- TypeScript
- Tailwind CSS
- next-intl
- Mapbox
- OpenStreetMap
- Leaflet
- SWR
- Jest / React Testing Library

## 开始使用

### 前提条件

首先，获取你的 Strava API 凭证：

1. 登录你的 Strava 账号：<https://www.strava.com/settings/api>
2. 进入 设置 > API
3. 创建应用程序以获取你的 **Client ID** 和 **Client Secret**

### 安装

1. 克隆仓库：

```bash
git clone https://github.com/hi-otto/strava-ride-insights.git
cd strava-ride-insights
```

### Docker（生产环境）

1. 配置环境变量：
   打开 `docker-compose.prod.yml` 并替换以下值为你的 Strava API 凭证：
   - `AUTH_STRAVA_ID`（你的 Client ID）
   - `AUTH_STRAVA_SECRET`（你的 Client Secret）

2. 运行应用：

```bash
docker compose -f docker-compose.prod.yml up -d
```

### NPM（开发环境）

1. 安装依赖：

```bash
npm install
```

1. 设置环境变量：
   创建 `.env.local` 文件并添加你的 Strava API 凭证：

```bash
AUTH_STRAVA_ID=your_client_id
AUTH_STRAVA_SECRET=your_client_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

1. 运行开发服务器：

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。
