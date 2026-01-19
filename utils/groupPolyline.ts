import { StravaActivity } from '@/types/strava'
import polyline from '@mapbox/polyline'

/**
 * Group polyline data by grid cells
 * @param data
 * @param gridSize 默认 200 x 200
 * @returns
 */
export default function groupPolyline(data: StravaActivity[], gridSize = 200) {
  const activitiesWithCenter = data
    .map(activity => {
      if (!activity.map?.summary_polyline) return null
      const points = polyline.decode(activity.map.summary_polyline)
      if (points.length === 0) return null

      // Calculate center
      const centerLat = points.reduce((sum, point) => sum + point[0], 0) / points.length
      const centerLng = points.reduce((sum, point) => sum + point[1], 0) / points.length

      return {
        activity,
        center: { lat: centerLat, lng: centerLng },
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const clusters: (typeof activitiesWithCenter)[] = []

  activitiesWithCenter.forEach(item => {
    // Find all clusters that this item is "close" to
    const matchingClusterIndices: number[] = []

    clusters.forEach((cluster, index) => {
      // Check if item is close to ANY activity in this cluster
      // We could optimize by checking against cluster centroid, but checking all points
      // ensures "chaining" works (transitive closure), which is usually expected for "connected" regions.
      const isClose = cluster.some(clusterItem => {
        const dist = getDistanceFromLatLonInKm(
          item.center.lat,
          item.center.lng,
          clusterItem.center.lat,
          clusterItem.center.lng
        )
        return dist <= gridSize // gridSize is in km
      })

      if (isClose) {
        matchingClusterIndices.push(index)
      }
    })

    if (matchingClusterIndices.length === 0) {
      // Create new cluster
      clusters.push([item])
    } else if (matchingClusterIndices.length === 1) {
      // Join existing cluster
      clusters[matchingClusterIndices[0]].push(item)
    } else {
      // Item bridges multiple clusters. Merge them.
      // 1. Pick the first one as base
      const baseIndex = matchingClusterIndices[0]
      const baseCluster = clusters[baseIndex]

      // 2. Add item
      baseCluster.push(item)

      // 3. Merge others into base (iterating backwards to avoid index shifting issues when splicing)
      for (let i = matchingClusterIndices.length - 1; i > 0; i--) {
        const removeIndex = matchingClusterIndices[i]
        const clusterToRemove = clusters[removeIndex]
        baseCluster.push(...clusterToRemove)
        clusters.splice(removeIndex, 1)
      }
    }
  })

  // Return raw activities grouped
  return clusters.map(cluster => cluster.map(item => item.activity))
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}
