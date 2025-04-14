"use client";

import { useTranslation } from "@/hooks/use-translation";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>
          {t("footerText")} &copy; {new Date().getFullYear()}
        </p>
        <a href="https://github.com/oyatillo071">Oyatillo</a>
      </div>
    </footer>
  );
}
