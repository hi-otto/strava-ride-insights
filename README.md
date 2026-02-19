# RideVista - Your Personal Cycling Dashboard

This project is 99% code generated using Bolt.new + windsurft + Claude. The heatmap UI is inspired by [city-roads](https://github.com/anvaka/city-roads). Huge thanks to anvaka!

A modern web application that integrates with Strava to visualize and analyze your cycling activities, generate an attractive annual cycling heatmap. Built with Next.js 16, featuring a beautiful UI and comprehensive statistics.

English | [简体中文](./README.zh-CN.md)

![image](https://github.com/user-attachments/assets/011e6598-2b0e-4b3c-a5d2-8ab9b242be21)

## Features

- Strava Integration
- Detailed Activity Statistics
- Activity Maps with Routes
- OpenStreetMap integration for fast map visualization
- Responsive Design
- Dark/Light Mode
- i18n Support (English/Chinese/Spanish)
- PWA Support (Installable App)
- Smart Caching System
  1. **File-Based Archive (Encrypted)**:
     - Activities older than 1 week are encrypted and stored locally.
     - Past years load instantly from this cache (Offline-first).
     - Current year loads from cache + fetches only new activities.
  2. **API Response Caching**:
     - Short-term caching (5 minutes) using Next.js `fetch` cache.
     - Prevents hitting rate limits during frequent reloads.

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- next-intl
- Mapbox
- OpenStreetMap
- Leaflet
- SWR
- Jest / React Testing Library

## Getting Started

### Prerequisites

First, get your Strava API credentials:

1. Log in to your Strava account at <https://www.strava.com/settings/api>
2. Go to Settings > API
3. Create an application to get your **Client ID** and **Client Secret**

### Installation

1. Clone the repository:

```bash
git clone https://github.com/hi-otto/strava-ride-insights.git
cd strava-ride-insights
```

### Docker (Production)

1. Configure environment variables:
   Open `docker-compose.prod.yml`. You don't need to set Strava credentials here anymore. They will be configured in the UI.

   **Important**: You must generate a secure `APP_SECRET` for encrypting credentials.
   Run the following command to generate one:

   ```bash
   openssl rand -hex 32
   ```

   Then paste it into `docker-compose.prod.yml`.

2. Run the application:

```bash
docker compose -f docker-compose.prod.yml up -d
```

### NPM (Development)

1. Install dependencies:

```bash
npm install
```

1. Set up environment variables:
   Create a `.env.local` file with your Strava API credentials:

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
APP_SECRET=your_generated_secret_key
```

Generate `APP_SECRET` with: `openssl rand -hex 32`

Note: Strava Client ID and Secret are now configured via the UI on the login page.

1. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
