import React from 'react'
import { Leaf, Sun, Cloud, Snowflake } from 'lucide-react'
import { SeasonalStatsData } from '../../types/stats'
import { useTranslations } from 'next-intl'
import { Distance } from '../basic/Distance'

interface SeasonalStatsProps {
  stats: SeasonalStatsData
}

export function SeasonalStats({ stats }: SeasonalStatsProps) {
  const t = useTranslations()

  const seasons = [
    { name: t('stats.seasonal.spring'), icon: Leaf, color: 'emerald', data: stats.spring },
    { name: t('stats.seasonal.summer'), icon: Sun, color: 'orange', data: stats.summer },
    { name: t('stats.seasonal.autumn'), icon: Cloud, color: 'yellow', data: stats.autumn },
    { name: t('stats.seasonal.winter'), icon: Snowflake, color: 'sky', data: stats.winter },
  ]

  const totalRides = seasons.reduce((sum, season) => sum + season.data.totalRides, 0)

  const getColorClass = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500'
      case 'orange':
        return 'bg-orange-500'
      case 'yellow':
        return 'bg-yellow-500'
      case 'sky':
        return 'bg-sky-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getIconColorClass = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'text-emerald-600'
      case 'orange':
        return 'text-orange-600'
      case 'yellow':
        return 'text-yellow-600'
      case 'sky':
        return 'text-sky-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/50 dark:to-teal-800/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl col-span-2">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
        {t('stats.seasonal.title')}
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {seasons.map(({ name, icon: Icon, color, data }) => (
          <div
            key={name}
            className="bg-white/60 dark:bg-white/5 p-4 rounded-lg transition-all duration-300 hover:bg-white/80 dark:hover:bg-white/10 hover:scale-105 hover:shadow-md"
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`h-5 w-5 ${getIconColorClass(color)} dark:text-${color}-400`} />
              <span className="font-medium text-gray-700 dark:text-gray-200">{name}</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('stats.seasonal.activityCount')}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {data.totalRides}
                    {t('stats.seasonal.rides')}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${getColorClass(color)} dark:opacity-90 transition-all duration-500 ease-out`}
                    style={{
                      width: `${(data.totalRides / totalRides) * 100}%`,
                      transform: 'translateX(0)',
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('stats.seasonal.avgDistance')}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    <Distance value={data.averageDistance} />
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('stats.seasonal.totalDistance')}: <Distance value={data.totalDistance} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
