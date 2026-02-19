'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function Login() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/strava/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientSecret, callbackUrl: callbackUrl || '/' })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to setup authentication')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="text-center space-y-6 max-w-xl mx-auto p-8 w-full">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('login.title')}</h2>

        <div className="space-y-4 text-left p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {t('login.instruction')}
            <br />
            <span className="font-semibold block mt-1">{t('login.leaveEmpty')}</span>
            <br />
            <a
              href="https://www.strava.com/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 font-medium underline"
            >
              {t('login.createLink')}
            </a>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('login.clientId')}
              </label>
              <input
                type="text"
                value={clientId}
                placeholder={t('login.savedPlaceholder')}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none placeholder:italic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('login.clientSecret')}
              </label>
              <input
                type="password"
                value={clientSecret}
                placeholder={t('login.savedPlaceholder')}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none placeholder:italic"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 bg-[#fc4c02] hover:bg-[#e34402] text-white rounded-md transition-colors disabled:opacity-50 font-semibold"
            >
              {loading ? t('login.connecting') : t('login.connectButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
