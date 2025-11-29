"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  CarListing,
} from "@/components/ui/car-listing-card";
import { ListingDashboard } from "@/components/dashboard/ListingDashboard";
import { useListings } from "@/contexts/ListingsContext";

// Helper function to transform scraped data into a CarListing object for the dashboard
const transformScrapedData = (data: any): CarListing => {
  // The API returns { listing, raw } structure
  const normalizedListing = data.listing || data;
  
  // Extract brand and model from title
  const title = normalizedListing.title || "";
  const [brand, model] = title ? title.split(/ (.*)/) : ["Unknown", ""];

  return {
    id: crypto.randomUUID(), // Generate unique ID instead of using URL
    url: normalizedListing.url,
    image: normalizedListing.images && normalizedListing.images.length > 0 ? normalizedListing.images[0] : undefined,
    images: normalizedListing.images || [],
    brand: brand,
    model: model || "",
    title: normalizedListing.title,
    year: normalizedListing.year,
    price: normalizedListing.priceEuro || normalizedListing.price,
    currency: normalizedListing.priceEuro ? "EUR" : normalizedListing.currency,
    priceLeva: normalizedListing.priceLeva,
    mileage: normalizedListing.mileageKm,
    mileageKm: normalizedListing.mileageKm,
    fuelType: normalizedListing.attributes?.[" Двигател"],
    transmission: normalizedListing.attributes?.["Скоростна кутия"],
    location: normalizedListing.location,
    description: normalizedListing.description,
    createdAt: normalizedListing.postedAt || new Date().toISOString(),
    postedAt: normalizedListing.postedAt,
    attributes: normalizedListing.attributes || {},
    vin: normalizedListing.vin || normalizedListing.attributes?.["VIN номер"],
  };
};

function ScrapePageContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const [listing, setListing] = useState<CarListing | null>(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const { addListing } = useListings();
  const savedUrlRef = useRef<string | null>(null); // Track if we've already saved this URL

  useEffect(() => {
    if (url && user) {
      const scrape = async () => {
        setLoading(true);
        setError(null);
        try {
          const token = await user.getIdToken();
          const response = await fetch("/api/scrape", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ url }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Something went wrong");
          }

          const result = await response.json();
          console.log("Scrape result:", JSON.stringify(result, null, 2));
          setData(result);
          
          const transformedListing = transformScrapedData(result);
          setListing(transformedListing);

          // Auto-save the listing only if we haven't saved this URL yet
          if (savedUrlRef.current !== transformedListing.url) {
            savedUrlRef.current = transformedListing.url;
            await addListing(transformedListing);
          } else {
            console.log("Already saved this URL in this session, skipping");
          }

        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      scrape();
    }
  }, [url, user, addListing]);

  if (!url) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>No URL provided. Please go back and enter a URL to scrape.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (listing) {
    return <ListingDashboard listing={listing} />;
  }

  return null;
}

export default function ScrapePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      }>
        <ScrapePageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
