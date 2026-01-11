'use client'
import React, { useState, useRef, useEffect, startTransition } from 'react'
import { Languages } from 'lucide-react'
import { setUserLocale } from '@/services/locale'
import { useLocale } from 'next-intl'
import { Locale } from '@/i18n/config'

const LanguageSwitcher: React.FC = () => {
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'en' as Locale, label: 'English' },
    { code: 'zh' as Locale, label: '中文' },
    { code: 'es' as Locale, label: 'Español' },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
      >
        <Languages className="h-5 w-5 mr-1.5" />
        <span>{currentLanguage.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-28 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 py-1">
          {languages.map(language => (
            <button
              key={language.code}
              onClick={() => {
                startTransition(() => {
                  setIsOpen(false)
                  setUserLocale(language.code)
                })
              }}
              className={`w-full text-left px-4 py-2 text-sm ${language.code === locale
                  ? 'text-orange-500 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 dark:hover:text-orange-400'
                } transition-colors`}
            >
              {language.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
