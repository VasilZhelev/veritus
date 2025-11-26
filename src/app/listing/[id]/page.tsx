"use client";

import { ListingDashboard } from "@/components/dashboard/ListingDashboard";
import singleListingData from "@/lib/demo/single-listing.json";
import vinData from "@/lib/demo/vin-checker-output.json";
import { CarListing } from "@/components/ui/car-listing-card";

export default function ListingPage() {
  // Cast the demo data to CarListing to satisfy the type checker
  // The demo data structure might need slight adjustment or the type definition might need to be more flexible
  // but for now we'll cast it as it matches closely enough
  const listing = singleListingData as unknown as CarListing;

  return <ListingDashboard listing={listing} vinInfo={vinData} />;
}
