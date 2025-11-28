"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  ExternalLink,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CarListing } from "@/components/ui/car-listing-card";

interface MainInfoTabProps {
  listing: CarListing;
}

export default function MainInfoTab({ listing }: MainInfoTabProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Handle images
  const listingImages = listing.images && Array.isArray(listing.images) 
    ? listing.images 
    : listing.image 
      ? [listing.image] 
      : [];

  const listingMileage = listing.mileageKm || listing.mileage;

  // Handle Escape key to close gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isGalleryOpen) {
        setIsGalleryOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGalleryOpen]);

  // Prevent body scroll when gallery is open
  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isGalleryOpen]);

  return (
    <div className="space-y-0">
      {/* Key Specs Section - White background with colored accent bar */}
      <div className="bg-white dark:bg-card border-r border-border/50 p-8 lg:p-12 relative">
        {/* Vertical accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-blue-500" />
        
        {/* Key Specs - Grid layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {[
            { label: "Year", value: listing.year || "—", icon: Calendar },
            { label: "Mileage", value: listingMileage ? `${(listingMileage / 1000).toFixed(0)}k km` : "—", icon: Gauge },
            { label: "Engine", value: listing.attributes?.["Двигател"] || listing.fuelType || "—", icon: Fuel },
            { label: "Transmission", value: listing.attributes?.["Скоростна кутия"] || listing.transmission || "—", icon: Settings },
          ].map(({ label, value, icon: Icon }) => (
            <div 
              key={label}
              className="bg-background p-5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <div className="text-xs uppercase tracking-wider font-medium">{label}</div>
              </div>
              <div className="text-xl font-bold">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Gallery */}
      {listingImages.length > 0 && (
        <div className="bg-muted/30 border-r border-border/50 p-8 lg:p-12 relative">
          {/* Colored corner accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent" />
          
          <h2 className="text-2xl font-bold mb-6 relative">
            <span className="inline-block border-l-4 border-primary pl-4">Photo Gallery</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {listingImages.slice(0, 8).map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setGalleryImageIndex(index);
                  setIsGalleryOpen(true);
                }}
                className={cn(
                  "relative aspect-video overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer",
                  "border-transparent hover:border-border"
                )}
              >
                <Image
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  unoptimized
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {listing.description && (
        <div className="bg-white dark:bg-card border-r border-border/50 p-8 lg:p-12 relative">
          {/* Vertical accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          
          <h2 className="text-2xl font-bold mb-6">Description</h2>
          <div className="relative">
            <p className={cn(
              "text-base leading-relaxed text-foreground/80 whitespace-pre-line transition-all duration-300",
              !isDescriptionExpanded && listing.description.length > 500 && "line-clamp-6"
            )}>
              {listing.description}
            </p>
            {listing.description.length > 500 && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-4 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
              >
                {isDescriptionExpanded ? "Show Less" : "Expand Description"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Technical Specifications */}
      <div className="bg-muted/30 border-r border-border/50 p-8 lg:p-12 relative">
        {/* Corner accent */}
        <div className="absolute top-0 left-0 w-24 h-1 bg-gradient-to-r from-primary to-blue-500" />
        
        <h2 className="text-2xl font-bold mb-8">Technical Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          {listing.attributes && Object.entries(listing.attributes)
            .filter(([key]) => !["Особености", "Местоположение", "Двигател", "Скоростна кутия", "Дата на производство", "Пробег"].includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-sm text-muted-foreground">{key}</span>
                <span className="font-semibold">{String(value)}</span>
              </div>
            ))}
        </div>
      </div>

      {/* External Link Button */}
      <div className="bg-white dark:bg-card border-r border-border/50 border-t border-border/30 p-8 lg:p-12 flex justify-center">
        <Button
          variant="outline"
          size="lg"
          className="px-8 border-2"
          asChild
        >
          <a href={listing.url} target="_blank" rel="noopener noreferrer">
            View Original Listing
            <ExternalLink className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </div>

      {/* Features */}
      {listing.attributes?.["Особености"] && (
        <div className="bg-white dark:bg-card border-r border-border/50 p-8 lg:p-12 relative">
          {/* Vertical accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
          
          <h2 className="text-2xl font-bold mb-6">Features & Equipment</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {listing.attributes["Особености"].split(", ").map((feature: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-1.5 h-1.5 bg-primary" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full-screen Gallery Modal */}
      {isGalleryOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setIsGalleryOpen(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsGalleryOpen(false);
            }}
            className="absolute top-4 right-4 text-white hover:text-white/70 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-[110]"
            aria-label="Close gallery"
          >
            <X className="w-8 h-8" />
          </button>
          
          {/* Previous Button */}
          {galleryImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setGalleryImageIndex(galleryImageIndex - 1);
              }}
              className="absolute left-4 text-white hover:text-white/70 text-6xl font-light w-16 h-16 flex items-center justify-center"
            >
              ‹
            </button>
          )}
          
          {/* Image */}
          <div 
            className="relative w-full h-full max-w-6xl max-h-[90vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={listingImages[galleryImageIndex]}
              alt={`Gallery image ${galleryImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
          </div>
          
          {/* Next Button */}
          {galleryImageIndex < listingImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setGalleryImageIndex(galleryImageIndex + 1);
              }}
              className="absolute right-4 text-white hover:text-white/70 text-6xl font-light w-16 h-16 flex items-center justify-center"
            >
              ›
            </button>
          )}
          
          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded">
            {galleryImageIndex + 1} / {listingImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
