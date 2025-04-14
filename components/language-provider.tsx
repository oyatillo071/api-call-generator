"use client"

import type React from "react"

import { createContext, useEffect } from "react"
import { useLanguageStore } from "@/store/language-store"

export const LanguageContext = createContext({
  language: "en",
  setLanguage: (language: string) => {},
})

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { language, setLanguage } = useLanguageStore()

  // Initialize language from localStorage on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [setLanguage])

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}
