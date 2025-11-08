"use client";

import { CarListingCard } from "@/components/ui/car-listing-card";
import { useListings } from "@/contexts/ListingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Trash2, Car, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ListingsPage() {
  const { listings, removeListing, clearListings } = useListings();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Car className="h-8 w-8" />
                {t("listings.title")}
              </h1>
              <p className="text-muted-foreground text-lg">
                {listings.length === 0
                  ? t("listings.empty")
                  : t("listings.count", { count: listings.length })}
              </p>
            </div>
            {listings.length > 0 && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={clearListings}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("listings.clearAll")}
                </Button>
                <Button asChild className="flex items-center gap-2">
                  <Link href="/">
                    <Plus className="h-4 w-4" />
                    {t("listings.addListing")}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 rounded-full bg-muted p-6">
              <Car className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {t("listings.noListings")}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t("listings.emptyDescription")}
            </p>
            <Button asChild size="lg" className="flex items-center gap-2">
              <Link href="/">
                <Plus className="h-4 w-4" />
                {t("listings.addFirst")}
              </Link>
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 gap-6",
              "sm:grid-cols-2",
              "lg:grid-cols-3",
              "xl:grid-cols-4"
            )}
          >
            {listings.map((listing) => (
              <CarListingCard
                key={listing.id}
                listing={listing}
                onDelete={removeListing}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

