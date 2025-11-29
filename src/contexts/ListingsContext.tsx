"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CarListing } from "@/components/ui/car-listing-card";
import { useAuth } from "./AuthContext";
import {
  getUserListings,
  saveListing as saveListingToFirestore,
  deleteListing as deleteListingFromFirestore,
  isListingSaved,
  toggleLikeListing,
} from "@/lib/firestore-service";
import { SavedListing, ChatMessage } from "@/lib/firestore-schema";

interface ListingsContextType {
  listings: CarListing[];
  savedListings: SavedListing[];
  addListing: (listing: Omit<CarListing, "id" | "createdAt"> & { id?: string; createdAt?: string }) => Promise<void>;
  removeListing: (id: string) => Promise<void>;
  clearListings: () => Promise<void>;
  saveListing: (
    listing: CarListing,
    chatHistory: ChatMessage[],
    metadata?: any
  ) => Promise<void>;
  unsaveListing: (listingId: string) => Promise<void>;
  isListingSaved: (listingId: string) => Promise<boolean>;
  loadSavedListings: () => Promise<void>;
  getSavedListingWithChat: (listingId: string) => SavedListing | undefined;
  toggleLike: (listingId: string) => Promise<void>;
}

const ListingsContext = createContext<ListingsContextType | undefined>(
  undefined
);

const STORAGE_KEY = "veritus-car-listings";

export function ListingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [listings, setListings] = useState<CarListing[]>([]);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (for non-authenticated users)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!user) {
      // Load from localStorage for non-authenticated users
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
    } else {
      setIsLoaded(true);
    }
  }, [user]);

  // Save to localStorage for non-authenticated users
  useEffect(() => {
    if (isLoaded && !user && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
      } catch (error) {
        console.error("Error saving listings to localStorage:", error);
      }
    }
  }, [listings, isLoaded, user]);

  // Load saved listings from Firestore when user authenticates
  useEffect(() => {
    if (user) {
      loadSavedListings();
    } else {
      setSavedListings([]);
    }
  }, [user]);

  const loadSavedListings = async () => {
    if (!user) return;

    try {
      const saved = await getUserListings(user.uid);
      setSavedListings(saved);
      
      // Also populate listings array with the listing data
      const listingData = saved.map((s) => ({
        ...s.listingData,
        savedAt: s.savedAt,
        likedAt: s.likedAt,
      }));
      setListings(listingData);
    } catch (error) {
      console.error("Error loading saved listings:", error);
    }
  };

  const addListing = async (listingData: Omit<CarListing, "id" | "createdAt"> & { id?: string; createdAt?: string }) => {
    const newListing = {
      ...listingData,
      id: listingData.id || crypto.randomUUID(),
      createdAt: listingData.createdAt || new Date().toISOString(),
    } as CarListing;
    
    if (user) {
      // For authenticated users, check Firestore directly for duplicates
      try {
        const existingListings = await getUserListings(user.uid);
        const existingByUrl = existingListings.find(s => s.listingData.url === newListing.url);
        
        if (existingByUrl) {
          return;
        }
        
        // Save to Firestore and reload
        await saveListing(newListing, []);
        await loadSavedListings();
      } catch (error) {
        console.error("Error auto-saving new listing:", error);
        throw error;
      }
    } else {
      // For guest users, check local state
      const existingByUrl = listings.find(l => l.url === newListing.url);
      if (existingByUrl) {
        return;
      }
      setListings((prev) => [newListing, ...prev]);
    }
  };

  const removeListing = async (id: string) => {
    // Remove from local state immediately for better UX
    setListings((prev) => prev.filter((listing) => listing.id !== id));
    
    // If user is authenticated, also delete from Firestore
    if (user) {
      try {
        await unsaveListing(id);
      } catch (error) {
        console.error("Error deleting listing from Firestore:", error);
        // Optionally reload listings to sync state
        await loadSavedListings();
      }
    }
  };

  const clearListings = async () => {
    if (user) {
      // For authenticated users, delete all from Firestore
      try {
        const allListings = await getUserListings(user.uid);
        await Promise.all(
          allListings.map(listing => deleteListingFromFirestore(user.uid, listing.id))
        );
        setSavedListings([]);
        setListings([]);
      } catch (error) {
        console.error("Error clearing Firestore listings:", error);
      }
    } else {
      // For guest users, clear localStorage
      setListings([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const saveListing = async (
    listing: CarListing,
    chatHistory: ChatMessage[] = [],
    metadata?: any
  ) => {
    if (!user) {
      throw new Error("User must be authenticated to save listings");
    }

    try {
      await saveListingToFirestore(user.uid, listing, chatHistory, metadata);
      await loadSavedListings(); // Reload to get updated data
    } catch (error) {
      console.error("Error saving listing:", error);
      throw error;
    }
  };

  const unsaveListing = async (listingId: string) => {
    if (!user) {
      throw new Error("User must be authenticated");
    }

    try {
      await deleteListingFromFirestore(user.uid, listingId);
      setSavedListings((prev) => prev.filter((s) => s.id !== listingId));
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (error) {
      console.error("Error unsaving listing:", error);
      throw error;
    }
  };

  const isListingSavedCheck = async (listingId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      return await isListingSaved(user.uid, listingId);
    } catch (error) {
      console.error("Error checking if listing is saved:", error);
      return false;
    }
  };

  const getSavedListingWithChat = (
    listingId: string
  ): SavedListing | undefined => {
    return savedListings.find((s) => s.id === listingId);
  };

  const toggleLike = async (listingId: string) => {
    if (!user) {
      // For guest users, we could implement local liking, but for now let's require auth
      // or maybe just store in local storage?
      // The requirement says "automatically saved in your listings", implying auth.
      // Let's prompt login if not logged in, or handle local state.
      // For now, let's just return if not logged in, or maybe throw to trigger UI prompt.
      throw new Error("User must be authenticated to like listings");
    }

    try {
      const isLiked = await toggleLikeListing(user.uid, listingId);
      
      // Update local state
      setSavedListings((prev) => 
        prev.map((s) => {
          if (s.id === listingId) {
            return {
              ...s,
              likedAt: isLiked ? new Date().toISOString() : undefined,
            };
          }
          return s;
        })
      );
      
      setListings((prev) => 
        prev.map((l) => {
          if (l.id === listingId) {
            return {
              ...l,
              likedAt: isLiked ? new Date().toISOString() : undefined,
            };
          }
          return l;
        })
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  };

  return (
    <ListingsContext.Provider
      value={{
        listings,
        savedListings,
        addListing,
        removeListing,
        clearListings,
        saveListing,
        unsaveListing,
        isListingSaved: isListingSavedCheck,
        loadSavedListings,
        getSavedListingWithChat,
        toggleLike,
      }}
    >
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
