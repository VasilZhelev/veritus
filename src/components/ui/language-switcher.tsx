"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Flag image components
const FlagIcon = ({ country, size = 24 }: { country: "en" | "bg"; size?: number }) => {
  const flagUrl = country === "en" 
    ? "/flags/gb-flag.svg"
    : "/flags/bg-flag.svg";
  
  return (
    <Image
      src={flagUrl}
      alt={country === "en" ? "English" : "Bulgarian"}
      width={size}
      height={size}
      className="rounded-full object-cover w-full h-full"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-11 w-11 rounded-full border-2 transition-all duration-300",
            "border-primary/20 hover:border-primary/60",
            "bg-gradient-to-br from-background to-muted/50",
            "hover:scale-110 hover:shadow-lg hover:shadow-primary/20",
            "backdrop-blur-sm shadow-md",
            "relative overflow-hidden group"
          )}
          aria-label="Change language"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex items-center justify-center w-full h-full overflow-hidden rounded-full">
            <FlagIcon country={language} size={44} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className="flex items-center justify-between cursor-pointer hover:bg-accent/50"
        >
          <div className="flex items-center gap-3">
            <FlagIcon country="en" size={20} />
            <span className="font-medium">English</span>
          </div>
          {language === "en" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("bg")}
          className="flex items-center justify-between cursor-pointer hover:bg-accent/50"
        >
          <div className="flex items-center gap-3">
            <FlagIcon country="bg" size={20} />
            <span className="font-medium">Български</span>
          </div>
          {language === "bg" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

