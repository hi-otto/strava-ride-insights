# RideVista - Your Personal Cycling Dashboard

This project is 99% code generated using Bolt.new + windsurft + Claude. The heatmap UI is inspired by [city-roads](https://github.com/anvaka/city-roads). Huge thanks to anvaka!

A modern web application that integrates with Strava to visualize and analyze your cycling activities, generate an attractive annual cycling heatmap. Built with Next.js 15, featuring a beautiful UI and comprehensive statistics.

English | [简体中文](./README.zh-CN.md)

![image](https://github.com/user-attachments/assets/011e6598-2b0e-4b3c-a5d2-8ab9b242be21)

## Features

- Strava Integration
- Detailed Activity Statistics
- Activity Maps with Routes
- Responsive Design
- Dark/Light Mode
- i18n Support (English/Chinese)

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- next-intl
- Mapbox
- OpenStreetMap

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/hi-otto/strava-ride-insights.git
cd strava-ride-insights
```

1. Install dependencies:

```bash
npm install
```

1. Set up environment variables:
   Create a `.env.local` file with:

   First, get your Strava API credentials from <https://www.strava.com/settings/api>:
   1. Log in to your Strava account
   2. Go to Settings > API
   3. Create an application to get your Client ID and Client Secret

```bash
AUTH_STRAVA_ID=your_client_id
AUTH_STRAVA_SECRET=your_client_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

1. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
