"use client"

import { useTranslation } from "@/hooks/use-translation"
import LanguageSwitcher from "./language-switcher"
import ThemeToggle from "./theme-toggle"

export default function Header() {
  const { t } = useTranslation()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("appTitle")}</h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
