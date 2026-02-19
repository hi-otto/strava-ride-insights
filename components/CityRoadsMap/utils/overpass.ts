import type { Bounds } from '../types'

const CACHE_EXPIRY_DAYS = 180
const DB_NAME = 'road_network_cache_v2'
const STORE_NAME = 'road_data'

interface CacheItem {
  bounds: Bounds
  data: any
  timestamp: number
}

interface DBSchema extends IDBDatabase {
  createObjectStore(name: string, options?: IDBObjectStoreParameters): IDBObjectStore
}

// 单例模式确保数据库连接的复用
let dbInstance: IDBDatabase | null = null

async function getDB(): Promise<DBSchema> {
  if (dbInstance) return dbInstance as DBSchema

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result as DBSchema)
    }

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result as DBSchema

      // 删除旧的数据库
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME)
      }

      // 创建新的数据库，使用复合索引
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      store.createIndex('bounds_idx', [
        'bounds.minLat',
        'bounds.maxLat',
        'bounds.minLng',
        'bounds.maxLng',
      ])
      store.createIndex('timestamp_idx', 'timestamp')
    }
  })
}

function isWithinBounds(inner: Bounds, outer: Bounds): boolean {
  return (
    inner.minLat >= outer.minLat &&
    inner.maxLat <= outer.maxLat &&
    inner.minLng >= outer.minLng &&
    inner.maxLng <= outer.maxLng
  )
}

function normalizeBounds(bounds: Bounds): Bounds {
  // 保留小数点后3位，提高精度到百米级别
  const precision = 3
  return {
    minLat: Number(Math.floor(bounds.minLat * Math.pow(10, precision)) / Math.pow(10, precision)),
    maxLat: Number(Math.ceil(bounds.maxLat * Math.pow(10, precision)) / Math.pow(10, precision)),
    minLng: Number(Math.floor(bounds.minLng * Math.pow(10, precision)) / Math.pow(10, precision)),
    maxLng: Number(Math.ceil(bounds.maxLng * Math.pow(10, precision)) / Math.pow(10, precision)),
  }
}

async function findCachedData(bounds: Bounds): Promise<CacheItem | null> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    // 使用游标遍历缓存数据
    const request = store.openCursor()
    const now = Date.now()
    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        const cacheItem = cursor.value as CacheItem

        // 检查是否过期
        if (now - cacheItem.timestamp < expiryTime) {
          // 检查边界框是否包含请求的区域
          if (isWithinBounds(bounds, cacheItem.bounds)) {
            resolve(cacheItem)
            return
          }
        }
        cursor.continue()
      } else {
        resolve(null)
      }
    }
  })
}

async function setCachedData(bounds: Bounds, data: any): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const cacheItem: CacheItem = {
      bounds,
      data,
      timestamp: Date.now(),
    }

    const request = store.add(cacheItem)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()

    // 清理过期数据
    const expiryTime = Date.now() - CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    const index = store.index('timestamp_idx')
    const range = IDBKeyRange.upperBound(expiryTime)

    index.openCursor(range).onsuccess = event => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }
  })
}

/**
 * 删除旧版本的道路网络缓存数据库
 */
async function deleteOldDB(): Promise<void> {
  try {
    // 检查旧版本数据库是否存在
    const oldDBExists = await new Promise<boolean>(async resolve => {
      try {
        // 获取数据库列表
        const databases = await indexedDB.databases()
        const exists = databases.some(db => db.name === 'road_network_cache')
        resolve(exists)
      } catch (error) {
        console.error('检查数据库是否存在时出错:', error)
        resolve(false)
      }
    })

    if (!oldDBExists) {
      return
    }

    // 删除v1版本的数据库
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('road_network_cache')
      request.onsuccess = () => {
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.warn('删除旧数据库失败:', error)
  }
}

export async function fetchRoadNetwork(bounds: Bounds) {
  // 删除旧版本数据库
  await deleteOldDB()

  // 规范化边界值以提高缓存命中率
  const normalizedBounds = normalizeBounds(bounds)

  try {
    // 尝试从缓存获取数据
    const cachedData = await findCachedData(normalizedBounds)
    if (cachedData) {
      return processRoadNetwork(cachedData.data)
    }
  } catch (error) {
    console.warn('Failed to read from cache:', error)
  }

  const query = `
    [out:json][timeout:25];
    (
      way["highway"](${normalizedBounds.minLat},${normalizedBounds.minLng},${normalizedBounds.maxLat},${normalizedBounds.maxLng});
    );
    out body;
    >;
    out skel qt;
  `

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch road network')
  }

  const data = await response.json()

  // 保存到缓存
  try {
    await setCachedData(normalizedBounds, data)
  } catch (error) {
    console.warn('Failed to write to cache:', error)
  }

  return processRoadNetwork(data)
}

function processRoadNetwork(data: any) {
  const nodes = new Map()
  const ways = []

  // 使用 for...of 循环替代 forEach 以提高性能
  for (const element of data.elements) {
    if (element.type === 'node') {
      nodes.set(element.id, [element.lat, element.lon])
    }
  }

  for (const element of data.elements) {
    if (element.type === 'way' && element.nodes && element.tags?.highway) {
      const coordinates = []
      for (const nodeId of element.nodes) {
        const coord = nodes.get(nodeId)
        if (coord) coordinates.push(coord)
      }

      if (coordinates.length > 1) {
        ways.push({
          coordinates,
          highway: element.tags.highway,
          importance: getRoadImportance(element.tags.highway), // 添加道路重要性
        })
      }
    }
  }

  return ways
}

// 道路重要性分级
function getRoadImportance(highway: string): number {
  const importanceMap: { [key: string]: number } = {
    motorway: 1,
    motorway_link: 1,
    trunk: 2,
    trunk_link: 2,
    primary: 3,
    primary_link: 3,
    secondary: 4,
    secondary_link: 4,
    tertiary: 5,
    tertiary_link: 5,
    residential: 6,
    living_street: 7,
  }
  return importanceMap[highway] || 8
}

// 根据缩放级别过滤道路
export function filterRoadsByZoom(roads: any[], zoomLevel: number): any[] {
  // 缩放级别越小，显示的道路重要性等级越高（数字越小）
  let maxImportance: number

  if (zoomLevel <= 0.8) {
    maxImportance = 3 // 只显示主要道路
  } else if (zoomLevel <= 1.5) {
    maxImportance = 5 // 显示次要道路
  } else {
    maxImportance = 8 // 显示所有道路
  }

  return roads.filter(road => road.importance <= maxImportance)
}
