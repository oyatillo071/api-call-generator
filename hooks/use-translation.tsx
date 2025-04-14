"use client"

import { useContext } from "react"
import { LanguageContext } from "@/components/language-provider"
import { translations } from "@/lib/translations"

export function useTranslation() {
  const { language } = useContext(LanguageContext)

  const t = (key: string) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return { t, language }
}
