"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Search, 
  TrendingUp, 
  Shield, 
  Users, 
  Target, 
  Zap, 
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  const values = [
    {
      icon: Search,
      title: t("about.values.smartAnalysis"),
      description: t("about.values.smartAnalysisDesc"),
    },
    {
      icon: Shield,
      title: t("about.values.trustedData"),
      description: t("about.values.trustedDataDesc"),
    },
    {
      icon: TrendingUp,
      title: t("about.values.marketInsights"),
      description: t("about.values.marketInsightsDesc"),
    },
    {
      icon: Zap,
      title: t("about.values.lightningFast"),
      description: t("about.values.lightningFastDesc"),
    },
  ];

  const stats = [
    { label: t("about.stats.listings"), value: "10K+", icon: Car },
    { label: t("about.stats.users"), value: "5K+", icon: Users },
    { label: t("about.stats.dataPoints"), value: "1M+", icon: Target },
    { label: t("about.stats.accuracy"), value: "99%", icon: CheckCircle2 },
  ];

  const features = [
    t("about.feature1"),
    t("about.feature2"),
    t("about.feature3"),
    t("about.feature4"),
    t("about.feature5"),
    t("about.feature6"),
  ];
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/20 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="outline" className="mb-6 gap-2">
              <Sparkles className="h-3 w-3" />
              {t("about.badge")}
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              {t("about.heroTitle")}
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              {t("about.heroDescription")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/">
                  {t("home.getStarted")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/listings">{t("about.viewListings")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("about.mission")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("about.missionDescription")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="mb-2 text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("about.values")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("about.valuesDescription")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-2 transition-all duration-300 hover:border-primary hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mb-2">{value.title}</CardTitle>
                    <CardDescription className="text-base">
                      {value.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                {t("about.features")}
              </Badge>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                {t("about.featuresTitle")}
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                {t("about.featuresDescription")}
              </p>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl border bg-card p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">BMW X5</div>
                      <div className="text-sm text-muted-foreground">2020 • 217,000 km</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="text-lg font-semibold">€40,898</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Fuel</div>
                      <div className="text-lg font-semibold">Diesel</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Engine</div>
                      <div className="text-lg font-semibold">3.0L</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Power</div>
                      <div className="text-lg font-semibold">265 HP</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 -inset-4 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("about.ctaTitle")}
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              {t("about.ctaDescription")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/">
                  {t("about.startSearching")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/listings">{t("about.viewListings")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

