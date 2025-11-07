"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { cn } from "@/lib/utils";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useListings } from "@/contexts/ListingsContext";
import { useRouter } from "next/navigation";

interface HeroAction {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

interface HeroProps {
  badge?: {
    text: string;
    action: {
      text: string;
      href: string;
    };
  };
  title: string;
  description: string;
  actions: HeroAction[];
  input?: {
    placeholders: string[];
    helperText?: string;
  };
  image: {
    light: string;
    dark: string;
    alt: string;
  };
}

export function HeroSection({
  badge,
  title,
  description,
  actions,
  input,
  image,
}: HeroProps) {
  const [isDark, setIsDark] = useState(false);
  const inputValueRef = useRef("");
  const { addListing } = useListings();
  const router = useRouter();

  useEffect(() => {
    const updateTheme = () => {
      if (typeof document !== "undefined") {
        setIsDark(document.documentElement.classList.contains("dark"));
      }
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  const imageSrc = !isDark ? image.light : image.dark;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    inputValueRef.current = event.target.value;
  };

  const extractCarInfoFromUrl = (url: string) => {
    // Try to extract basic info from mobile.bg URLs
    // Example: https://www.mobile.bg/obiava-21762431510491781-bmw-x5-m-pack-xdrive-360-kam-distronic-digital-pamet-lyuk
    const mobileBgMatch = url.match(/mobile\.bg\/obiava-\d+-(.+)/);
    if (mobileBgMatch) {
      const titlePart = mobileBgMatch[1];
      // Try to extract brand and model from the URL slug
      const parts = titlePart.split("-");
      let brand = "";
      let model = "";

      // Common car brands to look for
      const brands = [
        "bmw",
        "mercedes",
        "audi",
        "volkswagen",
        "ford",
        "toyota",
        "honda",
        "nissan",
        "hyundai",
        "kia",
        "peugeot",
        "renault",
        "opel",
        "skoda",
        "seat",
        "fiat",
        "citroen",
        "mazda",
        "suzuki",
        "volvo",
        "lexus",
      ];

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].toLowerCase();
        if (brands.includes(part)) {
          brand = part.charAt(0).toUpperCase() + part.slice(1);
          // Next part might be the model
          if (i + 1 < parts.length) {
            model =
              parts[i + 1].charAt(0).toUpperCase() + parts[i + 1].slice(1);
          }
          break;
        }
      }

      return {
        brand: brand || "Unknown",
        model: model || "Car",
        url,
      };
    }

    // Fallback for other URLs
    return {
      brand: "Unknown",
      model: "Car",
      url,
    };
  };

  const handleInputSubmit = (_event: FormEvent<HTMLFormElement>) => {
    const link = inputValueRef.current.trim();
    if (!link) {
      return;
    }

    // Extract basic info from URL
    const carInfo = extractCarInfoFromUrl(link);

    // Add listing
    addListing({
      ...carInfo,
      image: undefined, // Can be enhanced later with image extraction
      description: `Car listing from ${new URL(link).hostname}`,
    });

    // Clear input
    inputValueRef.current = "";

    // Optionally redirect to listings page
    // router.push("/listings");
  };

  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        "fade-bottom overflow-hidden pb-0"
      )}
    >
      <div className="mx-auto flex max-w-container flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="animate-appear gap-2">
              <span className="text-muted-foreground">{badge.text}</span>
              <a href={badge.action.href} className="flex items-center gap-1">
                {badge.action.text}
                <ArrowRightIcon className="h-3 w-3" />
              </a>
            </Badge>
          )}

          {/* Title */}
          <h1 className="relative z-10 inline-block animate-appear bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-md relative z-10 max-w-[550px] animate-appear font-medium text-muted-foreground opacity-0 delay-100 sm:text-xl">
            {description}
          </p>

          {/* Actions */}
          <div className="relative z-10 flex animate-appear justify-center gap-4 opacity-0 delay-200">
            {actions.map((action, index) => (
              <Button key={index} variant={action.variant} size="lg" asChild>
                <a href={action.href} className="flex items-center gap-2">
                  {action.icon}
                  {action.text}
                </a>
              </Button>
            ))}
          </div>

          {/* Input */}
          {input && (
            <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-3 animate-appear opacity-0 delay-300">
              <PlaceholdersAndVanishInput
                placeholders={input.placeholders}
                onChange={handleInputChange}
                onSubmit={handleInputSubmit}
              />
            </div>
          )}

          {/* Image with Glow */}
          <div className="relative pt-12">
            <MockupFrame
              className="animate-appear opacity-0 delay-700"
              size="small"
            >
              <Mockup type="responsive">
                <Image
                  src={imageSrc}
                  alt={image.alt}
                  width={1248}
                  height={765}
                  priority
                />
              </Mockup>
            </MockupFrame>
            <Glow
              variant="top"
              className="animate-appear-zoom opacity-0 delay-1000"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
