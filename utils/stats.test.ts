import { calculateStats, getYearlyActivities } from './stats'
import type { StravaActivity } from '../types/strava'

// Helper function to create mock activities
const createMockActivity = (overrides: Partial<StravaActivity> = {}): StravaActivity => ({
  id: 1,
  name: 'Test Activity',
  distance: 10000,
  moving_time: 1800,
  elapsed_time: 2000,
  total_elevation_gain: 100,
  type: 'Ride',
  sport_type: 'Ride',
  start_date: '2024-06-15T10:00:00Z',
  start_date_local: '2024-06-15T12:00:00Z',
  timezone: 'Europe/Madrid',
  utc_offset: 7200,
  achievement_count: 0,
  kudos_count: 0,
  comment_count: 0,
  athlete_count: 1,
  photo_count: 0,
  average_speed: 5.5,
  max_speed: 10,
  has_heartrate: false,
  heartrate_opt_out: false,
  elev_high: 150,
  elev_low: 50,
  trainer: false,
  commute: false,
  manual: false,
  private: false,
  visibility: 'everyone',
  start_latlng: [40.0, -3.0],
  end_latlng: [40.1, -3.1],
  map: {
    id: 'map1',
    summary_polyline: '',
    resource_state: 2,
  },
  athlete: {
    id: 123,
    resource_state: 1,
  },
  ...overrides,
})

describe('calculateStats', () => {
  it('should calculate stats from outdoor activities only', () => {
    const activities = [
      createMockActivity({
        distance: 10000,
        moving_time: 1800,
        total_elevation_gain: 100,
        trainer: false,
      }),
      createMockActivity({
        id: 2,
        distance: 20000,
        moving_time: 3600,
        total_elevation_gain: 200,
        trainer: false,
      }),
      createMockActivity({
        id: 3,
        distance: 5000,
        moving_time: 900,
        total_elevation_gain: 50,
        trainer: true,
      }), // Trainer - excluded
    ]

    const result = calculateStats(activities)

    expect(result.total_distance).toBe(30000)
    expect(result.total_time).toBe(5400)
    expect(result.total_elevation_gain).toBe(300)
    expect(result.total_activities).toBe(2)
  })

  it('should find longest ride', () => {
    const activities = [
      createMockActivity({ distance: 10000 }),
      createMockActivity({ id: 2, distance: 50000 }),
      createMockActivity({ id: 3, distance: 25000 }),
    ]

    const result = calculateStats(activities)

    expect(result.longest_ride).toBe(50000)
  })

  it('should find highest elevation', () => {
    const activities = [
      createMockActivity({ total_elevation_gain: 100 }),
      createMockActivity({ id: 2, total_elevation_gain: 1500 }),
      createMockActivity({ id: 3, total_elevation_gain: 800 }),
    ]

    const result = calculateStats(activities)

    expect(result.highest_elevation).toBe(1500)
  })

  it('should find fastest speed', () => {
    const activities = [
      createMockActivity({ max_speed: 10 }),
      createMockActivity({ id: 2, max_speed: 18 }),
      createMockActivity({ id: 3, max_speed: 12 }),
    ]

    const result = calculateStats(activities)

    expect(result.fastest_speed).toBe(18)
  })

  it('should handle empty array', () => {
    const result = calculateStats([])

    expect(result.total_distance).toBe(0)
    expect(result.total_time).toBe(0)
    expect(result.total_elevation_gain).toBe(0)
    expect(result.total_activities).toBe(0)
    expect(result.longest_ride).toBe(0)
    expect(result.highest_elevation).toBe(0)
    expect(result.fastest_speed).toBe(0)
  })

  it('should exclude all trainer activities', () => {
    const activities = [
      createMockActivity({ trainer: true }),
      createMockActivity({ id: 2, trainer: true }),
    ]

    const result = calculateStats(activities)

    expect(result.total_activities).toBe(0)
    expect(result.total_distance).toBe(0)
  })
})

describe('getYearlyActivities', () => {
  const activities = [
    createMockActivity({ id: 1, start_date: '2023-06-15T10:00:00Z' }),
    createMockActivity({ id: 2, start_date: '2024-03-15T10:00:00Z' }),
    createMockActivity({ id: 3, start_date: '2024-08-15T10:00:00Z' }),
    createMockActivity({ id: 4, start_date: '2025-01-15T10:00:00Z' }),
  ]

  it('should filter activities by year 2024', () => {
    const result = getYearlyActivities(activities, 2024)

    expect(result).toHaveLength(2)
    expect(result.map(a => a.id)).toEqual([2, 3])
  })

  it('should filter activities by year 2023', () => {
    const result = getYearlyActivities(activities, 2023)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('should filter activities by year 2025', () => {
    const result = getYearlyActivities(activities, 2025)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(4)
  })

  it('should return empty array for year with no activities', () => {
    const result = getYearlyActivities(activities, 2020)

    expect(result).toHaveLength(0)
  })

  it('should return empty array for empty input', () => {
    const result = getYearlyActivities([], 2024)

    expect(result).toHaveLength(0)
  })
})
