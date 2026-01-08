import { useMemo, useState } from 'react'
import { CityRoadsMap } from '../CityRoadsMap'
import { StravaActivity } from '@/types/strava'
import groupPolyline from '@/utils/groupPolyline'
import { Map as MapIcon, Layers } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic import for Leaflet map
const StandardMap = dynamic(
  () => import('../StandardMap').then((mod) => mod.StandardMap),
  { ssr: false }
)
interface HeatMapProps {
  activities?: StravaActivity[]
}

interface GridSize {
  value: number;
  label: string;
}

const ALL_GRID_SIZES: GridSize[] = [
  { value: 50, label: '50km' },
  { value: 100, label: '100km' },
  { value: 200, label: '200km' },
  { value: 500, label: '500km' },
  { value: 1000, label: '1000km' }
];

export function HeatMap({ activities }: HeatMapProps) {
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [gridSize, setGridSize] = useState<number>(ALL_GRID_SIZES[0].value);
  const [mapType, setMapType] = useState<'standard' | 'artistic'>('standard');

  const { groupedActivities, currentPolylines, startLatlng, currentStats, availableGridSizes } = useMemo(() => {
    if (!activities?.length) return {
      groupedActivities: [],
      currentPolylines: [],
      startLatlng: null,
      availableGridSizes: [],
      currentStats: {
        count: 0,
        distance: 0,
        time: 0,
        elevation: 0,
        speed: 0,
        power: 0,
        heartrate: 0
      }
    };

    // Calculate available grid sizes and their groups
    const availableSizes: GridSize[] = [];
    const allSizeGroups = new Map();

    for (const size of ALL_GRID_SIZES) {
      const groups = groupPolyline(activities.filter(a => a.sport_type !== 'VirtualRide' && a?.map?.summary_polyline), size.value)
        .map(group => ({
          activities: group,
          polylines: group
            .map(activity => activity.map.summary_polyline)
        }))
        .filter(group => group.polylines.length > 0)
        .sort((a, b) => b.activities.length - a.activities.length);

      allSizeGroups.set(size.value, groups);

      // Always include sizes until we hit the second single group
      if (availableSizes.length === 0 || // always include first size
        groups.length > 1 || // include sizes with multiple groups
        (groups.length === 1 && !availableSizes.some(s => allSizeGroups.get(s.value).length === 1))) { // include first single group
        availableSizes.push(size);
      } else {
        break; // Stop after we hit a second single group
      }
    }

    // If current grid size is not available, use the first available size
    if (!availableSizes.find(size => size.value === gridSize)) {
      setGridSize(availableSizes[0].value);
    }

    // Get groups for current grid size
    const groups = allSizeGroups.get(gridSize) || [];

    // Reset selected group if it's out of bounds
    if (selectedGroup >= groups.length) {
      setSelectedGroup(0);
    }

    // Get current group's polylines
    const currentGroup = groups[selectedGroup] || { activities: [], polylines: [] };

    // Get start location
    const startLocation = currentGroup.activities[0]?.start_latlng || activities[0].start_latlng;

    // Calculate total time and distance for average speed
    const totalTime = currentGroup.activities.reduce((sum, activity) => sum + activity.moving_time, 0);
    const totalDistance = currentGroup.activities.reduce((sum, activity) => sum + activity.distance, 0);

    // Calculate current group stats
    const stats = {
      count: currentGroup.activities.length,
      distance: totalDistance / 1000, // Convert to km
      time: totalTime / 3600, // Convert to hours
      elevation: currentGroup.activities.reduce((sum, activity) => sum + (activity.total_elevation_gain || 0), 0),
      speed: totalTime > 0 ? (totalDistance / totalTime) * 3.6 : 0, // Convert m/s to km/h
      power: Math.round(
        currentGroup.activities.reduce((sum, activity) => sum + (activity.average_watts || 0), 0) /
        currentGroup.activities.filter(activity => activity.average_watts).length || 0
      ),
      heartrate: Math.round(
        currentGroup.activities.reduce((sum, activity) => sum + (activity.average_heartrate || 0), 0) /
        currentGroup.activities.filter(activity => activity.average_heartrate).length || 0
      )
    };

    return {
      groupedActivities: groups,
      currentPolylines: currentGroup.polylines,
      startLatlng: startLocation,
      currentStats: stats,
      availableGridSizes: availableSizes
    };
  }, [activities, selectedGroup, gridSize]);

  if (!activities?.length) return null;
  if (!currentPolylines.length || !startLatlng) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors">
      <div className="relative aspect-[1/1] md:aspect-[16/9]">
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

        {mapType === 'standard' ? (
          <StandardMap
            key={selectedGroup}
            summaryPolylines={currentPolylines}
          />
        ) : (
          <CityRoadsMap
            key={selectedGroup}
            summaryPolylines={currentPolylines}
          />
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-2 items-center justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {currentStats.count}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {currentStats.distance.toFixed(0)} km
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {currentStats.time.toFixed(1)}h
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {currentStats.elevation.toFixed(0)}m
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                <path strokeLinecap="round" strokeWidth="2" d="M12 3v3 M12 18v3 M3 12h3 M18 12h3" />
                <path strokeLinecap="round" strokeWidth="2" d="M6.34 6.34l2.12 2.12 M15.54 15.54l2.12 2.12 M6.34 17.66l2.12-2.12 M15.54 8.46l2.12-2.12" />
              </svg>
              {currentStats.speed.toFixed(1)} km/h
            </span>
            {currentStats.power > 0 && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {currentStats.power}w
              </span>
            )}
            {currentStats.heartrate > 0 && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {currentStats.heartrate}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {availableGridSizes.length > 1 && (
              <div className="flex gap-1">
                {availableGridSizes.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setGridSize(value)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-all
                      ${gridSize === value
                        ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {groupedActivities.length > 1 && (
              <div className="flex gap-1.5">
                {groupedActivities.map((group, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedGroup(index)}
                    className={`min-w-[32px] h-8 px-2.5 text-xs font-medium rounded-full transition-all
                      ${selectedGroup === index
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-gray-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
