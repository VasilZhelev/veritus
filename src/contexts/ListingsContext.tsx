"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CarListing } from "@/components/ui/car-listing-card";

interface ListingsContextType {
  listings: CarListing[];
  addListing: (listing: Omit<CarListing, "id" | "createdAt">) => void;
  removeListing: (id: string) => void;
  clearListings: () => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

const STORAGE_KEY = "veritus-car-listings";

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load listings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setListings(parsed);
        }
      } catch (error) {
        console.error("Error loading listings from localStorage:", error);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Save listings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
      } catch (error) {
        console.error("Error saving listings to localStorage:", error);
      }
    }
  }, [listings, isLoaded]);

  const addListing = (listingData: Omit<CarListing, "id" | "createdAt">) => {
    const newListing: CarListing = {
      ...listingData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setListings((prev) => [newListing, ...prev]);
  };

  const removeListing = (id: string) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id));
  };

  const clearListings = () => {
    setListings([]);
  };

  return (
    <ListingsContext.Provider value={{ listings, addListing, removeListing, clearListings }}>
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (context === undefined) {
    throw new Error("useListings must be used within a ListingsProvider");
  }
  return context;
}

