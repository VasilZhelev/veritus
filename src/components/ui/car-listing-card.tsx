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
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Trash2,
  Calendar,
  Fuel,
  Gauge,
  MapPin,
  Settings,
  BookmarkCheck,
  Heart,
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
  vin?: string;
  savedAt?: string;
  [key: string]: any; // Allow other properties
}

interface CarListingCardProps {
  listing: CarListing;
  onDelete?: (id: string) => void;
  onToggleLike?: (id: string) => void;
  onToggleCompare?: (id: string) => void;
  isSelectedForCompare?: boolean;
  className?: string;
}

export function CarListingCard({
  listing,
  onDelete,
  onToggleLike,
  onToggleCompare,
  isSelectedForCompare,
  className,
}: CarListingCardProps) {
  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return "Price not available";
    const formatted = new Intl.NumberFormat("bg-BG").format(price);
    return currency ? `${formatted} ${currency}` : formatted;
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return "N/A";
    return `${new Intl.NumberFormat("bg-BG").format(mileage)} km`;
  };

  const excludedAttributes = [
    "id", "url", "image", "brand", "model", "year", "price", "currency",
    "mileage", "fuelType", "transmission", "location", "description",
    "createdAt", "source", "title", "priceText", "mileageText", "yearText",
    "rawDetails", "images", "postedAt", "vin",
    "Дата на производство", "Пробег", "Двигател", "Скоростна кутия", "Местоположение",
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
      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
        {listing.image ? (
          <Link href={`/listing/${listing.id}`} className="block w-full h-full">
            <Image
              src={listing.image}
              alt={`${listing.brand} ${listing.model}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </Link>
        ) : (
          <Link href={`/listing/${listing.id}`} className="flex items-center justify-center h-full w-full">
            <div className="text-center text-muted-foreground">
              <div className="text-6xl mb-2">🚗</div>
              <p className="text-sm">No image available</p>
            </div>
          </Link>
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
        {/* Saved Indicator */}
        {listing.savedAt && (
           <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 shadow-md z-10">
             <BookmarkCheck className="h-3 w-3" />
             Saved
           </div>
        )}
        
        {/* Like Button */}
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "absolute bottom-3 right-3 z-10 rounded-full shadow-md transition-all duration-300",
            listing.likedAt 
              ? "bg-red-500 text-white hover:bg-red-600 hover:text-white" 
              : "bg-white/90 text-zinc-500 hover:bg-white hover:text-red-500"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onToggleLike) onToggleLike(listing.id);
          }}
        >
          <Heart className={cn("h-5 w-5", listing.likedAt && "fill-current")} />
        </Button>

        {/* Compare Selection */}
        {onToggleCompare && (
          <div 
            className="absolute top-3 left-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 shadow-md",
                isSelectedForCompare 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "bg-white/90 text-zinc-600 hover:bg-white hover:text-blue-600 backdrop-blur-sm"
              )}
              onClick={(e) => {
                e.preventDefault();
                onToggleCompare(listing.id);
              }}
            >
              <div className={cn(
                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                isSelectedForCompare ? "border-white bg-blue-600" : "border-zinc-400 bg-transparent"
              )}>
                {isSelectedForCompare && <span className="text-[10px]">✓</span>}
              </div>
              Compare
            </div>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1">
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
            <Badge variant="secondary" className="text-base font-semibold px-3 py-1">
              {formatPrice(listing.price, listing.currency)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
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
      </CardContent>

      <CardFooter className="pt-4">
        <Button variant="outline" className="w-full group/btn" asChild>
          <Link
            href={`/listing/${listing.id}`}
            className="flex items-center justify-center gap-2"
          >
            View Details
            <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
