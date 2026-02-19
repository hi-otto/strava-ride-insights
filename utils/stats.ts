import type { StravaActivity, StravaStats } from '../types/strava'

export const calculateStats = (activities: StravaActivity[]): StravaStats => {
  const outdoorActivities = activities.filter(a => !a.trainer)
  return {
    total_distance: outdoorActivities.reduce((sum, a) => sum + a.distance, 0),
    total_elevation_gain: outdoorActivities.reduce((sum, a) => sum + a.total_elevation_gain, 0),
    total_time: outdoorActivities.reduce((sum, a) => sum + a.moving_time, 0),
    total_activities: outdoorActivities.length,
    longest_ride: outdoorActivities.reduce((max, a) => (a.distance > max ? a.distance : max), 0),
    highest_elevation: outdoorActivities.reduce(
      (max, a) => (a.total_elevation_gain > max ? a.total_elevation_gain : max),
      0
    ),
    fastest_speed: outdoorActivities.reduce((max, a) => (a.max_speed > max ? a.max_speed : max), 0),
  }
}

export const getYearlyActivities = (activities: StravaActivity[], year: number) => {
  return activities.filter(activity => {
    const activityYear = new Date(activity.start_date).getFullYear()
    return activityYear === year
  })
}
