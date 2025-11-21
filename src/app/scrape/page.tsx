"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  CarListingCard,
  CarListing,
} from "@/components/ui/car-listing-card";

// Helper function to transform scraped data into a CarListing object
const transformScrapedData = (data: any): CarListing => {
  const {
    title,
    priceText,
    currency,
    images,
    location,
    description,
    attributes,
    url,
    postedAt,
  } = data;

  // Extract brand and model from title
  const [brand, model] = title ? title.split(/ (.*)/s) : ["Unknown", ""];

  // Parse Year from "Дата на производство"
  const yearText = attributes?.["Дата на производство"];
  const year = yearText ? parseInt(yearText.match(/\d{4}/)?.[0] || "0") : undefined;

  // Parse Mileage
  const mileageText = attributes?.["Пробег"];
  const mileage = mileageText ? parseInt(mileageText.replace(/\D/g, "")) : undefined;
  
  // Get Fuel Type and Transmission
  const fuelType = attributes?.["Двигател"] ?? undefined;
  const transmission = attributes?.["Скоростна кутия"] ?? undefined;

  return {
    id: url || new Date().toISOString(), // Use URL as a unique ID
    url: url,
    image: images && images.length > 0 ? images[0] : undefined,
    brand: brand,
    model: model || "",
    year: year,
    price: priceText ? parseFloat(priceText.replace(/\s/g, "")) : undefined,
    currency: currency,
    mileage: mileage,
    fuelType: fuelType,
    transmission: transmission,
    location: location,
    description: description,
    createdAt: postedAt || new Date().toISOString(),
    attributes: attributes, // Pass all attributes
  };
};

export default function ScrapePage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const [listing, setListing] = useState<CarListing | null>(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
          setData(result);
          setListing(transformScrapedData(result));
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      scrape();
    }
  }, [url, user]);

  if (!url) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>No URL provided. Please go back and enter a URL to scrape.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Scraped Listing</h1>
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {listing && (
        <div className="max-w-4xl mx-auto">
          <CarListingCard listing={listing} />
        </div>
      )}
      {data && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Raw Scraped Data (for testing)</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
