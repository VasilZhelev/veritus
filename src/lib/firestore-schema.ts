// Firestore Database Schema and TypeScript Interfaces
import { CarListing } from "@/components/ui/car-listing-card";

// Chat message interface
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isTyping?: boolean;
}

// Saved listing with chat history
export interface SavedListing {
  id: string;
  listingData: CarListing;
  chatHistory: ChatMessage[];
  savedAt: string;
  lastModified: string;
  likedAt?: string; // Timestamp when the listing was liked
  metadata?: {
    vinInfo?: any;
    damageReport?: any;
    [key: string]: any;
  };
}

// User profile
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
}

// Firestore collection names
export const COLLECTIONS = {
  USERS: "users",
  SAVED_LISTINGS: "savedListings",
} as const;

// Helper to convert Firestore timestamp to ISO string
export const timestampToISO = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  return new Date().toISOString();
};
