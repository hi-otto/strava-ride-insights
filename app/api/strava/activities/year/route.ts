import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStravaActivities } from '@/utils/strava'
import { archiveActivities, getCachedActivities } from '@/services/activityCache'
import dayjs from 'dayjs'

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
    const year = searchParams.get('year')

    if (!year) {
      return NextResponse.json({ error: 'Year parameter is required' }, { status: 400 })
    }

    let startOfYear: number
    let endOfYear: number

    // year=0 表示获取所有数据
    if (year === '0') {
      startOfYear = 0
      endOfYear = Math.floor(Date.now() / 1000)
    } else {
      startOfYear = new Date(parseInt(year), 0, 1).getTime() / 1000
      endOfYear = new Date(parseInt(year) + 1, 0, 1).getTime() / 1000
    }

    // 1. Try to load from cache first
    let cachedActivities: any[] = []

    if (athleteId && refreshToken && year !== '0') {
      try {
        const currentYear = new Date().getFullYear().toString()
        const currentMonth = new Date().getMonth() + 1

        const months = Array.from({ length: 12 }, (_, i) => {
          // If expecting current year, don't ask for future months
          if (year === currentYear && i + 1 > currentMonth) {
            return null
          }
          return `${year}-${String(i + 1).padStart(2, '0')}`
        }).filter(Boolean) as string[]

        const cachedChunks = await Promise.all(
          months.map(month =>
            getCachedActivities(parseInt(athleteId.value), refreshToken.value, month)
          )
        )
        cachedActivities = cachedChunks.flat()
      } catch (e) {
        console.error('Error reading cache:', e)
      }
    }

    const currentYear = new Date().getFullYear().toString()

    // If it's a past year and we have data, return it! (Offline first / Fast load)
    // We assume past years don't change often.
    if (year !== currentYear && year !== '0' && cachedActivities.length > 0) {
      return NextResponse.json(cachedActivities)
    }

    // If it's the current year, we want to start fetching from the latest cached activity
    if (year === currentYear && cachedActivities.length > 0) {
      // Find the latest start_date in cache (timestamps)
      const latestActivity = cachedActivities.reduce((latest, current) => {
        const currentTs = new Date(current.start_date).getTime() / 1000
        return currentTs > latest ? currentTs : latest
      }, 0)

      if (latestActivity > startOfYear) {
        startOfYear = latestActivity
      }
    }

    // 2. Fetch missing data from Strava
    let page = 1
    const per_page = 100
    let fetchedActivities: any[] = []
    let hasMore = true

    while (hasMore) {
      const activities = await getStravaActivities(accessToken.value, {
        after: startOfYear,
        before: endOfYear,
        page,
        per_page,
      })

      if (activities.length === 0) {
        hasMore = false
      } else {
        // Archive chunk
        if (athleteId && refreshToken) {
          archiveActivities(parseInt(athleteId.value), activities, refreshToken.value).catch(
            err => {
              console.error('Failed to archive activities:', err)
            }
          )
        }
        fetchedActivities = [...fetchedActivities, ...activities]
        page++
      }
    }

    // 3. Merge cache and new data
    // Deduplicate by ID just in case
    const activityMap = new Map()
    cachedActivities.forEach(a => activityMap.set(a.id, a))
    fetchedActivities.forEach(a => activityMap.set(a.id, a))

    const finalActivities = Array.from(activityMap.values())

    // Sort by date descending
    finalActivities.sort(
      (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    )

    return NextResponse.json(finalActivities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}
