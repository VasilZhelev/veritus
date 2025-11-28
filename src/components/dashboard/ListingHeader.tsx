"use client";

import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { CarListing } from "@/components/ui/car-listing-card";
import { useState } from "react";

interface ListingHeaderProps {
  listing: CarListing;
}

export function ListingHeader({ listing }: ListingHeaderProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Use the first image or a fallback
  const heroImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : listing.image || "";

  const formatPrice = (price?: number | null, currency?: string | null) => {
    if (!price) return "Price not available";
    const formatted = new Intl.NumberFormat("en-US").format(price);
    return currency ? `${formatted} ${currency}` : formatted;
  };

  return (
    <div className="relative w-full h-[300px] overflow-hidden bg-black">
      {/* Background Image with Blur/Dim */}
      {heroImage && (
        <div className="absolute inset-0 opacity-60">
          <Image
            src={heroImage}
            alt={listing.title || "Car background"}
            fill
            className={cn(
              "object-cover transition-opacity duration-700 blur-sm scale-105",
              isImageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setIsImageLoaded(true)}
            priority
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-10">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
                {listing.title || `${listing.brand} ${listing.model}`}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <MapPin className="h-4 w-4" />
                  {listing.location || "Location N/A"}
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <Calendar className="h-4 w-4" />
                  {listing.postedAt || "Date N/A"}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                {formatPrice(listing.price, listing.currency)}
              </div>
              {listing.priceLeva && (
                <div className="text-sm text-white/70 font-medium mt-1">
                  ≈ {formatPrice(listing.priceLeva, "BGN")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
