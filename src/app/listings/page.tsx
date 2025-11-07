"use client";

import { CarListingCard } from "@/components/ui/car-listing-card";
import { useListings } from "@/contexts/ListingsContext";
import { Button } from "@/components/ui/button";
import { Trash2, Car, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ListingsPage() {
  const { listings, removeListing, clearListings } = useListings();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Car className="h-8 w-8" />
                Your Listings
              </h1>
              <p className="text-muted-foreground text-lg">
                {listings.length === 0
                  ? "No listings yet. Add your first car listing from the home page!"
                  : `You have ${listings.length} ${listings.length === 1 ? "listing" : "listings"}`}
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
                  Clear All
                </Button>
                <Button asChild className="flex items-center gap-2">
                  <Link href="/">
                    <Plus className="h-4 w-4" />
                    Add Listing
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
              No listings yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start by adding a car listing from the home page. Paste a car URL
              and we'll extract all the important details for you.
            </p>
            <Button asChild size="lg" className="flex items-center gap-2">
              <Link href="/">
                <Plus className="h-4 w-4" />
                Add Your First Listing
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

