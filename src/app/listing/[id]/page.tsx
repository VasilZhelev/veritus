"use client";

import { ListingDashboard } from "@/components/dashboard/ListingDashboard";
import singleListingData from "@/lib/demo/single-listing.json";
import vinData from "@/lib/demo/vin-checker-output.json";
import { CarListing } from "@/components/ui/car-listing-card";
import { useListings } from "@/contexts/ListingsContext";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ListingPage() {
  const params = useParams();
  const { listings, getSavedListingWithChat } = useListings();
  const [listing, setListing] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    if (id === "demo") {
      setListing(singleListingData as unknown as CarListing);
      setLoading(false);
      return;
    }

    // Try to find in current listings context (local + saved)
    const foundListing = listings.find((l) => l.id === id);
    
    if (foundListing) {
      setListing(foundListing);
    } else {
      // If not found in loaded listings, it might be a direct link to a saved listing
      // that hasn't loaded yet or isn't in the initial set.
      // But listings context loads saved listings on mount.
      // We could try to fetch it specifically if we had a method, but for now
      // let's assume if it's not in listings, it's not found.
      // OR we can check if it's a saved listing specifically
      const saved = getSavedListingWithChat(id);
      if (saved) {
        setListing(saved.listingData);
      }
    }
    setLoading(false);
  }, [params.id, listings, getSavedListingWithChat]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <p className="text-muted-foreground">The listing you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return <ListingDashboard listing={listing} vinInfo={vinData} />;
}
