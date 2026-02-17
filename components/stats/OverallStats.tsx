import React from 'react'
import { Activity, TrendingUp, Zap } from 'lucide-react'
import type { RideStats } from '../../types/stats'
import { useTranslations } from 'next-intl'
import { Distance } from '../basic/Distance'
import { Duration } from '../basic/Duration'
import { FormattedDate } from '../basic/FormattedDate'
import { Speed } from '../basic/Speed'

interface OverallStatsProps {
  stats: RideStats
}

export function OverallStats({ stats }: OverallStatsProps) {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 总览卡片 */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-gradient-to-br hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900 dark:hover:to-orange-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
            <Activity className="h-6 w-6 text-orange-600 dark:text-orange-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {t('stats.overview.title')}
          </h3>
        </div>
        <div className="space-y-4">
          <div className="group transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-300">
              {t('stats.overview.total_distance')}
            </p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 group-hover:scale-105 transition-transform">
              <Distance value={stats.totalDistance} />
            </p>
          </div>
          <div className="group transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-300">
              {t('stats.overview.total_time')}
            </p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 group-hover:scale-105 transition-transform">
              <Duration value={stats.totalTime} />
            </p>
          </div>
          <div className="group transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-300">
              {t('stats.overview.total_activities')}
            </p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 group-hover:scale-105 transition-transform">
              {stats.totalRides} {t('stats.overview.times')}
            </p>
          </div>
        </div>
      </div>

      {/* 最佳记录卡片 */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900 dark:hover:to-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
            <Zap className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {t('stats.best_records.title')}
          </h3>
        </div>
        <div className="space-y-4">
          <div className="group transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-300">
              {t('stats.best_records.longest_activity')}
            </p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 group-hover:scale-105 transition-transform">
              <Distance value={stats.longestRide.distance} />
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-300">
              <FormattedDate value={stats.longestRide.date} />
            </p>
          </div>
          <div className="group transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-300">
              {t('stats.best_records.highest_elevation')}
            </p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 group-hover:scale-105 transition-transform">
              {Math.round(stats.highestClimb.elevation)} {t('stats.meters')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-300">
              <FormattedDate value={stats.highestClimb.date} />
            </p>
          </div>
          <div className="group transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-300">
              {t('stats.best_records.fastest_speed')}
            </p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 group-hover:scale-105 transition-transform">
              <Speed value={stats.fastestSpeed.speed} />
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-300">
              <FormattedDate value={stats.fastestSpeed.date} />
            </p>
          </div>
        </div>
      </div>

      {/* 平均数据卡片 */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-gradient-to-br hover:from-green-100 hover:to-green-200 dark:hover:from-green-900 dark:hover:to-green-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {t('stats.average.title')}
          </h3>
        </div>
        <div className="space-y-4">
          <div className="group transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-300">
              {t('stats.average.average_distance')}
            </p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300 group-hover:scale-105 transition-transform">
              <Distance value={stats.averageDistance} />
            </p>
          </div>
          <div className="group transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-300">
              {t('stats.average.speed')}
            </p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300 group-hover:scale-105 transition-transform">
              <Speed value={stats.averageSpeed} />
            </p>
          </div>
          <div className="group transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-300">
              {t('stats.average.power')}
            </p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300 group-hover:scale-105 transition-transform">
              {stats.averagePower}W
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
