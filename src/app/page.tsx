"use client";

import { HeroSection } from "@/components/sections/hero";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <HeroSection
      badge={{
        text: t("home.badge"),
        action: { text: t("home.badgeAction"), href: "/" },
      }}
      title={t("home.title")}
      description={t("home.description")}
      actions={[
        { text: t("home.getStarted"), href: "/", variant: "default" },
        { text: t("home.viewDocs"), href: "/", variant: "outline" },
      ]}
      input={{
        placeholders: [
          t("home.inputPlaceholder"),
          "https://www.mobile.bg/obiava-21762431510491781-bmw-x5-m-pack-xdrive-360-kam-distronic-digital-pamet-lyuk",
        ],
        helperText: t("home.inputHelperText"),
      }}
      image={{
        light: "https://www.launchuicomponents.com/app-dark.png",
        dark: "https://www.launchuicomponents.com/app-dark.png",
        alt: "Hero preview",
      }}
    />
  );
}
