# RideVista - 你的个人骑行数据中心

这是一个99%的代码借助Bolt.new + windsurft + claude 生成的项目，热力图UI借鉴了 [city-roads](https://github.com/anvaka/city-roads) ，非常感谢 anvaka！

一个现代化的 Web 应用，集成 Strava 来可视化和分析你的骑行活动, 生成好看的年度骑行热力图。使用 Next.js 15 构建，具有精美的界面和全面的统计数据。

[English](./README.md) | 简体中文

![image](https://github.com/user-attachments/assets/ac189e33-0eaa-481f-85c9-c2d36eab3694)

## 功能特点

- 🔄 Strava 集成
- 📊 详细的活动统计
- 🗺️ 活动路线地图
- 📱 响应式设计
- 🌓 深色/浅色模式
- 🌍 国际化支持（中文/英文）

## 技术栈

- Next.js 15
- TypeScript
- Tailwind CSS
- next-intl
- Mapbox
- OpenStreetMap

## 开始使用

1. 克隆仓库：

```bash
git clone https://github.com/hi-otto/strava-ride-insights.git
cd strava-ride-insights
```

2. 安装依赖：

```bash
npm install
```

3. 设置环境变量：
   创建 `.env.local` 文件并添加：

   首先，从 https://www.strava.com/settings/api 获取你的 Strava API 凭证：
   1. 登录你的 Strava 账号
   2. 进入 设置 > API
   3. 创建应用程序以获取 Client ID 和 Client Secret

```
AUTH_STRAVA_ID=your_client_id
AUTH_STRAVA_SECRET=your_client_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. 运行开发服务器：

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint
- `npm run format` - 使用 Prettier 格式化代码
