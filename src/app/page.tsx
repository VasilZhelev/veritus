"use client";

import { HeroSection } from "@/components/sections/hero";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Activity, Search, Link2, MessageSquare, CheckCircle2 } from "lucide-react";
import FeaturesCards from "@/components/ui/feature-shader-cards";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1. Hero Section (No Image Mockup) */}
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
            "https://www.mobile.bg/obiava-...-bmw-x5",
          ],
          helperText: t("home.inputHelperText"),
        }}
      />

      {/* 2. Features Grid Section (Shaders) */}
      <FeaturesCards 
        title={t("home.features.title")}
        subtitle={t("home.features.subtitle")}
        features={[
          {
            title: t("home.feat1.title"),
            description: t("home.feat1.desc"),
            icon: <Activity className="h-10 w-10 text-white" />
          },
          {
            title: t("home.feat2.title"),
            description: t("home.feat2.desc"),
            icon: <ShieldCheck className="h-10 w-10 text-white" />
          },
          {
            title: t("home.feat3.title"),
            description: t("home.feat3.desc"),
            icon: <Search className="h-10 w-10 text-white" />
          }
        ]}
      />

      {/* 3. How It Works - Elegant Timeline */}
      <section className="py-24 bg-background relative border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-20 animate-appear">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t("home.howItWorks.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("home.howItWorks.subtitle")}
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:-translate-x-1/2 hidden sm:block" />

            <div className="space-y-16">
              {/* Step 1 */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between group">
                <div className="hidden md:block w-1/2 pr-12 text-right">
                  <h3 className="text-2xl font-bold mb-3">{t("home.step1.title")}</h3>
                  <p className="text-muted-foreground text-lg">{t("home.step1.desc")}</p>
                </div>
                <div className="absolute left-0 md:left-1/2 w-14 h-14 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center md:-translate-x-1/2 shadow-xl group-hover:border-primary transition-colors duration-500 z-10">
                  <Link2 className="h-6 w-6 text-primary" />
                </div>
                <div className="md:hidden pl-20 w-full pt-2">
                  <h3 className="text-xl font-bold mb-2">{t("home.step1.title")}</h3>
                  <p className="text-muted-foreground">{t("home.step1.desc")}</p>
                </div>
                <div className="hidden md:block w-1/2 pl-12" />
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between group">
                <div className="hidden md:block w-1/2 pr-12" />
                <div className="absolute left-0 md:left-1/2 w-14 h-14 rounded-full bg-background border-4 border-purple-500/20 flex items-center justify-center md:-translate-x-1/2 shadow-xl group-hover:border-purple-500 transition-colors duration-500 z-10">
                  <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="md:hidden pl-20 w-full pt-2">
                  <h3 className="text-xl font-bold mb-2">{t("home.step2.title")}</h3>
                  <p className="text-muted-foreground">{t("home.step2.desc")}</p>
                </div>
                <div className="hidden md:block w-1/2 pl-12 text-left">
                  <h3 className="text-2xl font-bold mb-3">{t("home.step2.title")}</h3>
                  <p className="text-muted-foreground text-lg">{t("home.step2.desc")}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between group">
                <div className="hidden md:block w-1/2 pr-12 text-right">
                  <h3 className="text-2xl font-bold mb-3">{t("home.step3.title")}</h3>
                  <p className="text-muted-foreground text-lg">{t("home.step3.desc")}</p>
                </div>
                <div className="absolute left-0 md:left-1/2 w-14 h-14 rounded-full bg-background border-4 border-green-500/20 flex items-center justify-center md:-translate-x-1/2 shadow-xl group-hover:border-green-500 transition-colors duration-500 z-10">
                  <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="md:hidden pl-20 w-full pt-2">
                  <h3 className="text-xl font-bold mb-2">{t("home.step3.title")}</h3>
                  <p className="text-muted-foreground">{t("home.step3.desc")}</p>
                </div>
                <div className="hidden md:block w-1/2 pl-12" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Final CTA */}
      <section className="py-24 relative overflow-hidden border-t border-border/50">
        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] -z-10" />
        
        <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight text-foreground">
            {t("home.cta.title")}
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t("home.cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95" asChild>
              <Link href="/">
                {t("home.cta.button")} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mt-4 sm:mt-0 sm:ml-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Free to start analyzing
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
