import React from 'react'
import { Calendar } from 'lucide-react'
import type { WeekdayStats } from '../../types/stats'
import { useTranslations } from 'next-intl'
import { Distance } from '../basic/Distance'

interface WeekendStatsProps {
  stats: WeekdayStats
}

export function WeekendStats({ stats }: WeekendStatsProps) {
  const t = useTranslations()
  const totalRides = stats.weekday.totalRides + stats.weekend.totalRides
  const weekdayPercentage = (stats.weekday.totalRides / totalRides) * 100
  const weekendPercentage = (stats.weekend.totalRides / totalRides) * 100

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-200 dark:bg-indigo-800 rounded-lg">
          <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {t('stats.weekday_stats.title')}
        </h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {t('stats.weekday_stats.weekday_activities')}
            </span>
            <span className="font-medium text-indigo-700 dark:text-indigo-300">
              {stats.weekday.totalRides}
              {t('stats.weekday_stats.times')}
            </span>
          </div>
          <div className="w-full bg-indigo-100 dark:bg-indigo-800 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-500"
              style={{ width: `${weekdayPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('stats.weekday_stats.average')} <Distance value={stats.weekday.averageDistance} />
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {t('stats.weekday_stats.weekend_activities')}
            </span>
            <span className="font-medium text-indigo-700 dark:text-indigo-300">
              {stats.weekend.totalRides}
              {t('stats.weekday_stats.times')}
            </span>
          </div>
          <div className="w-full bg-indigo-100 dark:bg-indigo-800 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-500"
              style={{ width: `${weekendPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('stats.weekday_stats.average')} <Distance value={stats.weekend.averageDistance} />
          </p>
        </div>
      </div>
    </div>
  )
}
