import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStravaActivities } from '@/utils/strava'
import { archiveActivities } from '@/services/activityCache'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('strava_access_token')
  const refreshToken = cookieStore.get('strava_refresh_token')
  const athleteId = cookieStore.get('strava_athlete_id')

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const params = {
      before: searchParams.get('before') ? Number(searchParams.get('before')) : undefined,
      after: searchParams.get('after') ? Number(searchParams.get('after')) : undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      per_page: searchParams.get('per_page') ? Number(searchParams.get('per_page')) : undefined,
    }

    const activities = await getStravaActivities(accessToken.value, params)

    // Background archiving
    if (athleteId && refreshToken && Array.isArray(activities)) {
      archiveActivities(parseInt(athleteId.value), activities, refreshToken.value).catch(err => {
        console.error('Failed to archive activities:', err)
      })
    }

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}
