"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ExternalLink, Trash2, Calendar, Fuel, Gauge, MapPin } from "lucide-react";

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
  location?: string;
  description?: string;
  createdAt: string;
}

interface CarListingCardProps {
  listing: CarListing;
  onDelete?: (id: string) => void;
  className?: string;
}

export function CarListingCard({ listing, onDelete, className }: CarListingCardProps) {
  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return "Price not available";
    const formatted = new Intl.NumberFormat("en-US").format(price);
    return currency ? `${formatted} ${currency}` : formatted;
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return "N/A";
    return `${new Intl.NumberFormat("en-US").format(mileage)} km`;
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
        "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
        {listing.image ? (
          <Image
            src={listing.image}
            alt={`${listing.brand} ${listing.model}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-2">🚗</div>
              <p className="text-sm text-muted-foreground">No image available</p>
            </div>
          </div>
        )}
        {/* Delete Button */}
        {onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(listing.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1">
              {listing.brand} {listing.model}
            </h3>
            {listing.year && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
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

      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {listing.mileage && (
            <div className="flex items-center gap-2 text-sm">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{formatMileage(listing.mileage)}</span>
            </div>
          )}
          {listing.fuelType && (
            <div className="flex items-center gap-2 text-sm">
              <Fuel className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{listing.fuelType}</span>
            </div>
          )}
          {listing.location && (
            <div className="flex items-center gap-2 text-sm col-span-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{listing.location}</span>
            </div>
          )}
        </div>
        {listing.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="outline"
          className="w-full group/btn"
          asChild
        >
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

