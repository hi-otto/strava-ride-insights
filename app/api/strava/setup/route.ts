import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { encrypt, decrypt } from '@/lib/crypto'

export async function POST(request: Request) {
  try {
    let { clientId, clientSecret, callbackUrl } = await request.json()
    const cookieStore = await cookies()

    // If credentials are not provided, try to get them from saved cookie
    if (!clientId || !clientSecret) {
      const appCreds = cookieStore.get('strava_app_creds')
      if (appCreds) {
        try {
          const decrypted = await decrypt(appCreds.value)
          const creds = JSON.parse(decrypted)
          clientId = creds.clientId
          clientSecret = creds.clientSecret
        } catch (e) {
          console.error('Failed to decrypt saved creds', e)
        }
      }
    }

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Credentials not provided and no saved credentials found.' },
        { status: 400 }
      )
    }

    // Encrypt credentials
    const credentials = JSON.stringify({ clientId, clientSecret })
    const encryptedCreds = await encrypt(credentials)

    // Store in temporary cookie for the callback
    cookieStore.set('strava_creds_temp', encryptedCreds, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300, // 5 minutes
    })

    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/strava/callback`
    const scope = 'read,activity:read_all'
    const state = callbackUrl || '/'

    // Ensure state is properly encoded
    const encodedState = encodeURIComponent(state)

    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${REDIRECT_URI}&approval_prompt=force&scope=${scope}&state=${encodedState}`

    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error('Error in setup:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
