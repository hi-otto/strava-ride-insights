import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import withPWAInit from '@ducanh2912/next-pwa'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
}

const withPWA = withPWAInit({
  dest: 'public',
  disable: false, // Enable PWA in development mode
})

export default withPWA(withNextIntl(nextConfig))
