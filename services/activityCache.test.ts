/**
 * @jest-environment node
 */
import { archiveActivities, getCachedActivities } from './activityCache'
import fs from 'fs/promises'
import path from 'path'
import dayjs from 'dayjs'

// Mock the CACHE_DIR constant or use a spy?
// Since it's hardcoded in the module, let's create a wrapper or just use the real fs path but clean it up.
// Actually, the module defines CACHE_DIR globally. That's tricky for testing safely.
// However, the module exports `ensureCacheDir` implicitly via usage.

// Strategy: We can't easily change the module-level constant CACHE_DIR without a refactor or mocking 'path'.
// Let's assume for this test we write to the real ./data/cache but use a fake athleteId to avoid collisions.
// Then clean up.

const TEST_ATHLETE_ID = 999999
const TEST_KEY = 'test-key-cache-123'

describe('activityCache', () => {
  const cacheDir = path.join(process.cwd(), 'data', 'cache', TEST_ATHLETE_ID.toString())

  beforeEach(async () => {
    try {
      await fs.rm(cacheDir, { recursive: true, force: true })
    } catch {}
  })

  afterAll(async () => {
    try {
      await fs.rm(cacheDir, { recursive: true, force: true })
    } catch {}
  })

  it('should archive old activities', async () => {
    const oldActivity = {
      id: 1,
      name: 'Old Ride',
      start_date: dayjs().subtract(10, 'day').toISOString(),
    }
    const newActivity = {
      id: 2,
      name: 'New Ride',
      start_date: dayjs().toISOString(), // Today
    }

    await archiveActivities(TEST_ATHLETE_ID, [oldActivity, newActivity], TEST_KEY)

    // Should create a file for the old activity's month
    const month = dayjs(oldActivity.start_date).format('YYYY-MM')
    const filePath = path.join(cacheDir, `${month}.bin`)

    try {
      await fs.access(filePath)
    } catch {
      fail(`File ${filePath} should exist`)
    }

    // Read back
    const cached = await getCachedActivities(TEST_ATHLETE_ID, TEST_KEY)
    expect(cached).toHaveLength(1)
    expect(cached[0].id).toBe(oldActivity.id)
    expect(cached.find(a => a.id === newActivity.id)).toBeUndefined()
  })

  it('should update existing archive', async () => {
    const activity1 = {
      id: 1,
      start_date: dayjs().subtract(10, 'day').toISOString(),
    }

    await archiveActivities(TEST_ATHLETE_ID, [activity1], TEST_KEY)

    const activity2 = {
      id: 2,
      start_date: dayjs().subtract(10, 'day').toISOString(), // Same day
    }

    await archiveActivities(TEST_ATHLETE_ID, [activity2], TEST_KEY)

    const cached = await getCachedActivities(TEST_ATHLETE_ID, TEST_KEY)
    expect(cached).toHaveLength(2)
    // activity1 might be first or second, sort to be safe
    cached.sort((a: any, b: any) => a.id - b.id)
    expect(cached[0].id).toBe(1)
    expect(cached[1].id).toBe(2)
  })

  it('should handle encryption key change (cache miss)', async () => {
    const activity1 = {
      id: 1,
      start_date: dayjs().subtract(10, 'day').toISOString(),
    }

    // Archive with Key A
    await archiveActivities(TEST_ATHLETE_ID, [activity1], 'KEY_A')

    // Try to read with Key B -> Should return empty or handle error gracefully
    const cachedB = await getCachedActivities(TEST_ATHLETE_ID, 'KEY_B')
    // getCachedActivities returns what it can decrypt. If file fails, it logs and returns others (or empty).
    expect(cachedB).toEqual([])

    // Archive with Key B (should overwrite/reset)
    // The logic in archiveActivities: "If file doesn't exist or decryption fails ... start fresh"
    const activity2 = {
      id: 2, // New activity
      start_date: dayjs().subtract(10, 'day').toISOString(),
    }
    // Note: We are passing activity1 AND activity2 ideally if we fetched from Strava.
    // But if we only pass activity2, it will overwrite and lose activity1 validly because Key A is gone.

    await archiveActivities(TEST_ATHLETE_ID, [activity2], 'KEY_B')

    const cachedFinal = await getCachedActivities(TEST_ATHLETE_ID, 'KEY_B')
    expect(cachedFinal).toHaveLength(1)
    expect(cachedFinal[0].id).toBe(2)
  })
})
