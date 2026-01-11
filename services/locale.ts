'use server'

import { cookies, headers } from 'next/headers'
import { Locale } from '@/i18n/config'

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = 'NEXT_LOCALE'

/**
 * Detects the user's preferred locale.
 * Priority:
 * 1. Cookie (user's explicit preference)
 * 2. Browser Accept-Language header (if Chinese, use 'zh', otherwise 'en')
 */
export async function getUserLocale(): Promise<Locale> {
  // First check if user has set a preference via cookie
  const cookieLocale = (await cookies()).get(COOKIE_NAME)?.value as Locale | undefined
  if (cookieLocale) {
    return cookieLocale
  }

  // Detect browser language from Accept-Language header
  const acceptLanguage = (await headers()).get('accept-language')?.toLowerCase() || ''

  // Check if the browser language includes Chinese (zh, zh-CN, zh-TW, zh-HK, etc.)
  if (/^zh|,\s*zh/.test(acceptLanguage)) {
    return 'zh'
  }

  // Check if the browser language includes Spanish (es, es-ES, es-MX, etc.)
  if (/^es|,\s*es/.test(acceptLanguage)) {
    return 'es'
  }

  // Default to English
  return 'en'
}

export async function setUserLocale(locale: Locale) {
  ; (await cookies()).set(COOKIE_NAME, locale)
}
