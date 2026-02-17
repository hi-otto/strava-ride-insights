// src/hooks/useStatsActivities.ts
import useSWR from 'swr'
import type { StravaActivity } from '../types/strava'

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(response.status === 401 ? 'Session expired' : 'Failed to fetch')
  }
  const data = await response.json()
  // Return all activities
  return data
}

export function useStatsActivities(year?: number) {
  const currentYear = new Date().getFullYear()
  const isCurrentYear = year === currentYear

  const {
    data: activities,
    error,
    isLoading,
  } = useSWR<StravaActivity[]>(
    year !== undefined ? `/api/strava/activities/year?year=${year}` : null,
    fetcher,
    {
      revalidateIfStale: isCurrentYear,
      revalidateOnFocus: isCurrentYear,
      revalidateOnReconnect: false,
      dedupingInterval: isCurrentYear ? 5 * 60 * 1000 : 30 * 60 * 1000, // 5分钟（当前年）或30分钟（历史年份）
    }
  )

  return {
    activities: activities || [],
    isLoading,
    error: error?.message || null,
  }
}
