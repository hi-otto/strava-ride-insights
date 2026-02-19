import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { exchangeToken } from '@/utils/strava'
import { decrypt, encrypt } from '@/lib/crypto'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const callbackUrl = decodeURIComponent(searchParams.get('state') || '/')

  if (error || !code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=access_denied`)
  }

  try {
    const cookieStore = await cookies()

    // 1. Get encrypted credentials from temp cookie
    const tempCreds = cookieStore.get('strava_creds_temp')
    let clientId, clientSecret

    if (tempCreds) {
      try {
        const decrypted = await decrypt(tempCreds.value)
        const creds = JSON.parse(decrypted)
        clientId = creds.clientId
        clientSecret = creds.clientSecret

        // Clean up temp cookie
        cookieStore.delete('strava_creds_temp')
      } catch (e) {
        console.error('Failed to decrypt temp creds', e)
      }
    }

    // Fallback to env vars if not found in cookie
    if (!clientId) clientId = process.env.AUTH_STRAVA_ID
    if (!clientSecret) clientSecret = process.env.AUTH_STRAVA_SECRET

    const tokens = await exchangeToken(code, clientId, clientSecret)

    // Store tokens in cookies
    const cs = cookieStore
    cs.set('strava_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(tokens.expires_at * 1000),
    })

    cs.set('strava_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
    })

    // Store app credentials permanently (encrypted)
    if (clientId && clientSecret) {
      const appCreds = JSON.stringify({ clientId, clientSecret })
      const encryptedAppCreds = await encrypt(appCreds)

      cs.set('strava_app_creds', encryptedAppCreds, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year
      })
    }

    return NextResponse.redirect(new URL(callbackUrl, process.env.NEXT_PUBLIC_BASE_URL))
  } catch (error) {
    console.error('Error exchanging token:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=token_exchange`)
  }
}
