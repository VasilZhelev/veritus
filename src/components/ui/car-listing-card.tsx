"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Trash2,
  Calendar,
  Fuel,
  Gauge,
  MapPin,
  Settings,
} from "lucide-react";

export interface CarListing {
  id: string;
  url: string;
  image?: string;
  brand: string;
  model: string;
  year?: number;
  price?: number;
  currency?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  location?: string;
  description?: string;
  createdAt: string;
  [key: string]: any; // Allow other properties
}

interface CarListingCardProps {
  listing: CarListing;
  onDelete?: (id: string) => void;
  className?: string;
}

export function CarListingCard({
  listing,
  onDelete,
  className,
}: CarListingCardProps) {
  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return "Price not available";
    const formatted = new Intl.NumberFormat("bg-BG").format(price); // Use Bulgarian format for consistency
    return currency ? `${formatted} ${currency}` : formatted;
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return "N/A";
    return `${new Intl.NumberFormat("bg-BG").format(mileage)} km`;
  };

  // Attributes to exclude from the "Other Attributes" section
  const excludedAttributes = [
    "id",
    "url",
    "image",
    "brand",
    "model",
    "year",
    "price",
    "currency",
    "mileage",
    "fuelType",
    "transmission",
    "location",
    "description",
    "createdAt",
    "source",
    "title",
    "priceText",
    "mileageText",
    "yearText",
    "rawDetails",
    "images",
    "postedAt",
    "Дата на производство", // Already shown as 'year'
    "Пробег", // Already shown as 'mileage'
    "Двигател", // Already shown as 'fuelType'
    "Скоростна кутия", // Already shown as 'transmission'
    "Местоположение", // Already shown as 'location'
  ];

  const otherAttributes = Object.entries(listing.attributes || {}).filter(
    ([key]) => !excludedAttributes.includes(key) && key !== "Особености"
  );
  
  const features = listing.attributes?.["Особености"]?.split(', ');

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl",
        "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
        className,
      )}
    >
      {/* Image Section */}
      <div className="relative w-full h-72 overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
        {listing.image ? (
          <Image
            src={listing.image}
            alt={`${listing.brand} ${listing.model}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <div className="text-6xl mb-2">🚗</div>
              <p className="text-sm">No image available</p>
            </div>
          </div>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={() => onDelete(listing.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {listing.brand} {listing.model}
            </h3>
            {listing.year && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{listing.year}</span>
              </div>
            )}
          </div>
          {listing.price && (
            <Badge
              variant="secondary"
              className="text-lg font-semibold px-4 py-2"
            >
              {formatPrice(listing.price, listing.currency)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
          {listing.mileage && (
            <div className="flex items-center gap-2 text-sm">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatMileage(listing.mileage)}</span>
            </div>
          )}
          {listing.fuelType && (
            <div className="flex items-center gap-2 text-sm">
              <Fuel className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{listing.fuelType}</span>
            </div>
          )}
          {listing.transmission && (
            <div className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{listing.transmission}</span>
            </div>
          )}
          {listing.location && (
            <div className="flex items-center gap-2 text-sm col-span-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{listing.location}</span>
            </div>
          )}
        </div>
        
        {listing.description && (
          <div className="mb-6">
            <h4 className="font-semibold text-md mb-2">Описание</h4>
            <p className="text-sm text-muted-foreground">
              {listing.description}
            </p>
          </div>
        )}

        {otherAttributes.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-md mb-3">Основни Характеристики</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              {otherAttributes.map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-dashed pb-1">
                  <span className="font-medium text-foreground">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {features && features.length > 0 && (
           <div className="mb-6">
            <h4 className="font-semibold text-md mb-3">Особености</h4>
            <div className="columns-2 sm:columns-3 text-sm text-muted-foreground">
              {features.map((feature) => (
                <div key={feature} className="mb-1">{feature}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4">
        <Button variant="outline" className="w-full group/btn" asChild>
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            View Listing
            <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
