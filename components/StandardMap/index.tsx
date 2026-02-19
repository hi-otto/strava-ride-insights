'use client'

import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import polyline from '@mapbox/polyline'

// Fix Leaflet default icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface StandardMapProps {
  summaryPolyline?: string
  summaryPolylines?: string[]
}

function MapBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap()
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] })
    }
  }, [map, bounds])
  return null
}

export function StandardMap({ summaryPolyline, summaryPolylines }: StandardMapProps) {
  const polylines = useMemo(() => {
    const lines = []
    if (summaryPolyline) lines.push(summaryPolyline)
    if (summaryPolylines) lines.push(...summaryPolylines)
    return lines
  }, [summaryPolyline, summaryPolylines])

  const decodedPolylines = useMemo(() => {
    return polylines.map(line => polyline.decode(line))
  }, [polylines])

  const bounds = useMemo(() => {
    if (decodedPolylines.length === 0) return null

    // Calculate bounds from all points safely avoiding stack overflow
    const allPoints = decodedPolylines.flat()
    if (allPoints.length === 0) return null

    // Use a loop or reduce to find min/max to avoid "Maximum call stack size exceeded"
    // when spreading large arrays into Math.min/Math.max
    let minLat = Infinity
    let maxLat = -Infinity
    let minLng = Infinity
    let maxLng = -Infinity

    for (const p of allPoints) {
      const lat = p[0]
      const lng = p[1]
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
    }

    return [
      [minLat, minLng],
      [maxLat, maxLng],
    ]
  }, [decodedPolylines])

  if (decodedPolylines.length === 0) return null

  // Calculate center from bounds or first point
  const center = bounds
    ? [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]
    : decodedPolylines[0][0]

  return (
    <MapContainer
      center={center as L.LatLngExpression}
      zoom={13}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {decodedPolylines.map((positions, idx) => (
        <Polyline key={idx} positions={positions} pathOptions={{ color: '#fc4c02', weight: 3 }} />
      ))}

      {bounds && <MapBounds bounds={bounds as L.LatLngBoundsExpression} />}
    </MapContainer>
  )
}
