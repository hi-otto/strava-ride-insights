import React, { useState, useRef, useCallback } from 'react'
import { Download, X, Settings } from 'lucide-react'
import type { StravaActivity } from '@/types/strava'
import { useTranslations } from 'next-intl'
import html2canvas from 'html2canvas'
import polyline from '@mapbox/polyline'

interface ActivityShareProps {
  activity: StravaActivity
  isOpen: boolean
  onClose: () => void
}

interface ShareField {
  key: keyof StravaActivity | 'duration' | 'distance_km' | 'elevation' | 'speed_kmh' | 'power'
  label: string
  value: string
}

export function ActivityShare({ activity, isOpen, onClose }: ActivityShareProps) {
  const t = useTranslations()
  const shareRef = useRef<HTMLDivElement>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'duration',
    'distance_km',
    'elevation',
  ])
  const [isGenerating, setIsGenerating] = useState(false)

  // 路线图尺寸配置 - 统一管理
  const ROUTE_MAP_CONFIG = {
    width: 300,
    height: 180,
    strokeWidth: 4,
    padding: 15,
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDistance = (distance: number) => {
    return `${(distance / 1000).toFixed(2)} km`
  }

  const formatElevation = (elevation: number) => {
    return `${elevation}m`
  }

  const formatSpeed = (speed: number) => {
    return `${(speed * 3.6).toFixed(1)} km/h`
  }

  const formatPower = (watts?: number) => {
    return watts ? `${Math.round(watts)}W` : '-'
  }

  const availableFields: ShareField[] = [
    {
      key: 'duration',
      label: t('activities.card.duration'),
      value: formatDuration(activity.moving_time),
    },
    {
      key: 'distance_km',
      label: t('activities.card.distance'),
      value: formatDistance(activity.distance),
    },
    {
      key: 'elevation',
      label: t('activities.card.elevation'),
      value: formatElevation(activity.total_elevation_gain),
    },
    {
      key: 'speed_kmh',
      label: t('activities.card.speed'),
      value: formatSpeed(activity.average_speed),
    },
    {
      key: 'power',
      label: t('activities.card.average_power'),
      value: formatPower(activity.average_watts),
    },
  ]

  const selectedFieldsData = availableFields
    .filter(field => selectedFields.includes(field.key as string))
    .slice(0, 3)

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldKey)) {
        return prev.filter(key => key !== fieldKey)
      } else if (prev.length < 3) {
        return [...prev, fieldKey]
      } else {
        // 替换第一个字段
        return [fieldKey, ...prev.slice(1)]
      }
    })
  }

  const generatePolylineFromSummary = (summaryPolyline: string) => {
    try {
      const points = polyline.decode(summaryPolyline)
      if (points.length < 2) return ''

      // 计算边界框
      const lats = points.map(p => p[0])
      const lngs = points.map(p => p[1])
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLng = Math.min(...lngs)
      const maxLng = Math.max(...lngs)

      // 计算范围，保持纵横比
      const latRange = maxLat - minLat
      const lngRange = maxLng - minLng

      // SVG 尺寸
      const svgWidth = ROUTE_MAP_CONFIG.width
      const svgHeight = ROUTE_MAP_CONFIG.height
      const padding = ROUTE_MAP_CONFIG.padding

      // 计算缩放比例，保持纵横比
      const scaleX = (svgWidth - 2 * padding) / lngRange
      const scaleY = (svgHeight - 2 * padding) / latRange
      const scale = Math.min(scaleX, scaleY)

      // 计算居中偏移
      const centerX = svgWidth / 2
      const centerY = svgHeight / 2
      const centerLat = (minLat + maxLat) / 2
      const centerLng = (minLng + maxLng) / 2

      const paths = points.map((point, index) => {
        // 正确的坐标变换，保持地理正确性
        const x = centerX + (point[1] - centerLng) * scale
        const y = centerY - (point[0] - centerLat) * scale // 注意Y轴翻转
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
      })

      return paths.join(' ')
    } catch (error) {
      console.error('Polyline 解码失败:', error)
      // 如果解码失败，返回一个简单的示例路线
      // 使用配置生成示例路线
      const w = ROUTE_MAP_CONFIG.width
      const h = ROUTE_MAP_CONFIG.height
      return `M ${w * 0.17} ${h * 0.5} Q ${w * 0.33} ${h * 0.22} ${w * 0.6} ${h * 0.5} Q ${w * 0.73} ${h * 0.72} ${w * 0.93} ${h * 0.5}`
    }
  }

  const generateAndDownload = useCallback(async () => {
    if (!shareRef.current) return

    setIsGenerating(true)

    try {
      // 获取元素的实际尺寸
      const rect = shareRef.current.getBoundingClientRect()

      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: null, // 透明背景
        scale: 3, // 高分辨率
        useCORS: true,
        allowTaint: true,
        removeContainer: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        // 确保捕获完整内容
        height: Math.max(rect.height, 500),
        width: rect.width,
      })

      const link = document.createElement('a')
      link.download = `strava-share-${activity.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('生成图片失败:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [activity.name])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">分享活动</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {/* 字段选择 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                选择显示字段 (最多3个)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availableFields.map(field => (
                <button
                  key={field.key as string}
                  onClick={() => handleFieldToggle(field.key as string)}
                  className={`p-2 text-sm rounded-md border transition-colors ${
                    selectedFields.includes(field.key as string)
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
                      : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  {field.label}
                </button>
              ))}
            </div>
          </div>

          {/* 预览区域 */}
          <div className="mb-4">
            <div className="rounded-lg p-2 bg-black" style={{ minHeight: '450px' }}>
              <div
                ref={shareRef}
                className="bg-transparent p-8 relative rounded-lg flex flex-col"
                style={{ width: '300px', minHeight: '420px', margin: '0 auto' }}
              >
                {/* 数据指标 - 垂直排列，从上往下 */}
                <div className="space-y-4 mb-4 flex-shrink-0">
                  {selectedFieldsData.map(field => (
                    <div key={field.key as string} className="text-center">
                      <div className="text-sm text-white tracking-wide">{field.label}</div>
                      <div className="text-3xl font-bold text-white">{field.value}</div>
                    </div>
                  ))}
                </div>

                {/* 路线图形 - 底部，更大 */}
                {activity.map?.summary_polyline && (
                  <div className="w-full flex-shrink-0">
                    <svg
                      className="w-full"
                      style={{ height: `${ROUTE_MAP_CONFIG.height}px` }}
                      viewBox={`0 0 ${ROUTE_MAP_CONFIG.width} ${ROUTE_MAP_CONFIG.height}`}
                    >
                      <path
                        d={generatePolylineFromSummary(activity.map.summary_polyline)}
                        stroke="#FC4C02"
                        strokeWidth={ROUTE_MAP_CONFIG.strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={generateAndDownload}
              disabled={isGenerating}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? '生成中...' : '下载图片'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
