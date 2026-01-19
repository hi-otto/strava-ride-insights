import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { refreshStravaToken } from './utils/strava'

// 不需要认证的路由
const publicPaths = ['/login', '/example']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 如果是公开路由，直接放行
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get('strava_access_token')
  const refreshToken = request.cookies.get('strava_refresh_token')

  if (!accessToken || !refreshToken) {
    // 重定向到登录页面，并记录原始URL
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURIComponent(pathname))
    return NextResponse.redirect(url)
  }

  // 检查是否需要刷新token
  const response = NextResponse.next()

  try {
    const tokens = await refreshStravaToken(refreshToken.value)

    // 更新cookies中的tokens
    response.cookies.set('strava_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(tokens.expires_at * 1000),
    })

    response.cookies.set('strava_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
    })
  } catch (error) {
    console.error('Error refreshing token:', error)
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURIComponent(pathname))
    return NextResponse.redirect(url)
  }

  return response
}

// 配置需要中间件处理的路由
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg|.*\\.ico|manifest\\.json$|sw\\.js$|workbox-.*\\.js$).*)',
  ],
}
