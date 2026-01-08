import { useState } from 'react'
import { CityRoadsMap } from './CityRoadsMap'
import type { StravaActivity } from '../types/strava'
import dynamic from 'next/dynamic'
import { Map as MapIcon, Layers } from 'lucide-react'

// Dynamic import for Leaflet map to avoid window is not defined error
const StandardMap = dynamic(
  () => import('./StandardMap').then((mod) => mod.StandardMap),
  { ssr: false }
)

interface ActivityMapProps {
  activity: StravaActivity
}

export function ActivityMap({ activity }: ActivityMapProps) {
  const [mapType, setMapType] = useState<'standard' | 'artistic'>('standard')

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-[1001] bg-white/90 dark:bg-gray-800/90 p-1 rounded-lg shadow-lg backdrop-blur-sm flex gap-1">
        <button
          onClick={() => setMapType('standard')}
          className={`p-2 rounded-md transition-colors ${mapType === 'standard'
            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          title="Standard Map"
        >
          <MapIcon size={20} />
        </button>
        <button
          onClick={() => setMapType('artistic')}
          className={`p-2 rounded-md transition-colors ${mapType === 'artistic'
            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          title="Artistic Map"
        >
          <Layers size={20} />
        </button>
      </div>

      <div className="h-[400px] w-full rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
        {mapType === 'standard' ? (
          <StandardMap summaryPolyline={activity.map.summary_polyline} />
        ) : (
          <CityRoadsMap summaryPolyline={activity.map.summary_polyline} />
        )}
      </div>
    </div>
  )
}
