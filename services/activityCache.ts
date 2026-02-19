import fs from 'fs/promises'
import path from 'path'
import { encryptAndCompress, decompressAndDecrypt } from '@/utils/secureStorage'
import dayjs from 'dayjs'

const CACHE_DIR = path.join(process.cwd(), 'data', 'cache')

// Ensure cache directory exists
async function ensureCacheDir(athleteId: number) {
  const dir = path.join(CACHE_DIR, athleteId.toString())
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
  return dir
}

export async function archiveActivities(
  athleteId: number,
  activities: any[],
  encryptionKey: string
) {
  if (!activities || activities.length === 0) return

  const userCacheDir = await ensureCacheDir(athleteId)
  const oneWeekAgo = dayjs().subtract(7, 'day')

  // Group activities by month (YYYY-MM)
  const activitiesByMonth: Record<string, any[]> = {}

  for (const activity of activities) {
    const activityDate = dayjs(activity.start_date)
    // Only archive old activities
    if (activityDate.isBefore(oneWeekAgo)) {
      const monthKey = activityDate.format('YYYY-MM')
      if (!activitiesByMonth[monthKey]) {
        activitiesByMonth[monthKey] = []
      }
      activitiesByMonth[monthKey].push(activity)
    }
  }

  // Process each month
  for (const [month, newActivities] of Object.entries(activitiesByMonth)) {
    const filePath = path.join(userCacheDir, `${month}.bin`)
    let existingActivities: any[] = []

    try {
      // Try to read existing file
      const fileBuffer = await fs.readFile(filePath)
      existingActivities = decompressAndDecrypt(fileBuffer, encryptionKey)
    } catch (error) {
      // If file doesn't exist or decryption fails (key changed), start fresh
      // We treat decryption failure as empty cache to allow overwriting with new key
      console.warn(`Cache miss or decryption failed for ${filePath}. Overwriting.`)
    }

    // Merge and deduplicate
    const activityMap = new Map()
    existingActivities.forEach(a => activityMap.set(a.id, a))
    newActivities.forEach(a => activityMap.set(a.id, a))

    const mergedActivities = Array.from(activityMap.values())

    // Encrypt and save
    const encryptedBuffer = encryptAndCompress(mergedActivities, encryptionKey)
    await fs.writeFile(filePath, encryptedBuffer)
  }
}

export async function getCachedActivities(
  athleteId: number,
  encryptionKey: string,
  month?: string
): Promise<any[]> {
  const userCacheDir = await ensureCacheDir(athleteId)
  let files = []

  try {
    if (month) {
      files = [`${month}.bin`]
    } else {
      files = await fs.readdir(userCacheDir)
    }
  } catch {
    return []
  }

  let allActivities: any[] = []

  for (const file of files) {
    if (!file.endsWith('.bin')) continue
    const filePath = path.join(userCacheDir, file)

    try {
      const fileBuffer = await fs.readFile(filePath)
      const activities = decompressAndDecrypt(fileBuffer, encryptionKey)
      allActivities = allActivities.concat(activities)
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, which is expected for future months or empty months
        continue
      }
      console.warn(`Failed to decrypt cache file ${file}. Ignoring.`)
      // We return what we can. The caller will likely fetch missing data from API.
    }
  }

  return allActivities
}
