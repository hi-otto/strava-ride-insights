import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('strava_access_token')

  if (!accessToken) {
    return NextResponse.json({ isAuthenticated: false })
  }

  try {
    const response = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }

    const userData = await response.json()
    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: userData.id,
        name: `${userData.firstname} ${userData.lastname}`,
        image: userData.profile,
        created_at: userData.created_at,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
