// Firestore Service Layer for CRUD Operations
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  SavedListing,
  ChatMessage,
  COLLECTIONS,
  timestampToISO,
} from "./firestore-schema";
import { CarListing } from "@/components/ui/car-listing-card";

/**
 * Save a listing with chat history to Firestore
 */
export async function saveListing(
  userId: string,
  listing: CarListing,
  chatHistory: ChatMessage[] = [],
  metadata?: { vinInfo?: any; damageReport?: any }
): Promise<void> {
  const listingRef = doc(
    db,
    COLLECTIONS.USERS,
    userId,
    COLLECTIONS.SAVED_LISTINGS,
    listing.id
  );

  // Check if listing exists to preserve likedAt
  const docSnap = await getDoc(listingRef);
  let existingData = {};
  if (docSnap.exists()) {
    existingData = docSnap.data();
  }

  // Remove undefined values (Firestore doesn't support them)
  const cleanListing = JSON.parse(JSON.stringify(listing));

  const savedListing: any = {
    listingData: cleanListing,
    chatHistory,
    metadata: metadata || {},
    savedAt: (existingData as any).savedAt || serverTimestamp(),
    lastModified: serverTimestamp(),
    // Preserve likedAt if it exists
    likedAt: (existingData as any).likedAt || null,
  };

  await setDoc(listingRef, savedListing, { merge: true });
}

/**
 * Toggle like status for a listing
 */
export async function toggleLikeListing(
  userId: string,
  listingId: string
): Promise<boolean> {
  const listingRef = doc(
    db,
    COLLECTIONS.USERS,
    userId,
    COLLECTIONS.SAVED_LISTINGS,
    listingId
  );

  const docSnap = await getDoc(listingRef);
  
  if (!docSnap.exists()) {
    // If it doesn't exist, we can't like it (it should be saved first via auto-save)
    // Or we could auto-save it here if we had the listing data, but we only have ID.
    // Assuming auto-save happens on view/create, so it should exist.
    throw new Error("Listing must be saved before liking");
  }

  const data = docSnap.data();
  const isLiked = !!data.likedAt;

  if (isLiked) {
    // Unlike
    await updateDoc(listingRef, {
      likedAt: null,
      lastModified: serverTimestamp(),
    });
    return false;
  } else {
    // Like
    await updateDoc(listingRef, {
      likedAt: serverTimestamp(),
      lastModified: serverTimestamp(),
    });
    return true;
  }
}

/**
 * Update chat history for an existing saved listing
 */
export async function updateChatHistory(
  userId: string,
  listingId: string,
  messages: ChatMessage[]
): Promise<void> {
  const listingRef = doc(
    db,
    COLLECTIONS.USERS,
    userId,
    COLLECTIONS.SAVED_LISTINGS,
    listingId
  );

  await updateDoc(listingRef, {
    chatHistory: messages,
    lastModified: serverTimestamp(),
  });
}

/**
 * Get all saved listings for a user
 */
export async function getUserListings(
  userId: string
): Promise<SavedListing[]> {
  const listingsRef = collection(
    db,
    COLLECTIONS.USERS,
    userId,
    COLLECTIONS.SAVED_LISTINGS
  );
  const q = query(listingsRef, orderBy("savedAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      listingData: data.listingData,
      chatHistory: data.chatHistory || [],
      savedAt: timestampToISO(data.savedAt),
      lastModified: timestampToISO(data.lastModified),
      likedAt: data.likedAt ? timestampToISO(data.likedAt) : undefined,
      metadata: data.metadata || {},
    } as SavedListing;
  });
}

/**
 * Get a specific saved listing
 */
export async function getSavedListing(
  userId: string,
  listingId: string
): Promise<SavedListing | null> {
  const listingRef = doc(
    db,
    COLLECTIONS.USERS,
    userId,
    COLLECTIONS.SAVED_LISTINGS,
    listingId
  );
  const docSnap = await getDoc(listingRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    listingData: data.listingData,
    chatHistory: data.chatHistory || [],
    savedAt: timestampToISO(data.savedAt),
    lastModified: timestampToISO(data.lastModified),
    likedAt: data.likedAt ? timestampToISO(data.likedAt) : undefined,
    metadata: data.metadata || {},
  } as SavedListing;
}

/**
 * Delete a saved listing
 */
export async function deleteListing(
  userId: string,
  listingId: string
): Promise<void> {
  const listingRef = doc(
    db,
    COLLECTIONS.USERS,
    userId,
    COLLECTIONS.SAVED_LISTINGS,
    listingId
  );
  await deleteDoc(listingRef);
}

/**
 * Check if a listing is saved
 */
export async function isListingSaved(
  userId: string,
  listingId: string
): Promise<boolean> {
  const listingRef = doc(
    db,
    COLLECTIONS.USERS,
    userId,
    COLLECTIONS.SAVED_LISTINGS,
    listingId
  );
  const docSnap = await getDoc(listingRef);
  return docSnap.exists();
}

/**
 * Migrate listings from localStorage to Firestore
 */
export async function migrateLocalStorageListings(
  userId: string
): Promise<number> {
  if (typeof window === "undefined") return 0;

  const STORAGE_KEY = "veritus-car-listings";
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (!stored) return 0;

  try {
    const listings: CarListing[] = JSON.parse(stored);
    let migratedCount = 0;

    for (const listing of listings) {
      // Check if listing already exists in Firestore
      const exists = await isListingSaved(userId, listing.id);
      if (!exists) {
        await saveListing(userId, listing, []);
        migratedCount++;
      }
    }

    // Clear localStorage after successful migration
    if (migratedCount > 0) {
      localStorage.removeItem(STORAGE_KEY);
    }

    return migratedCount;
  } catch (error) {
    console.error("Error migrating localStorage listings:", error);
    return 0;
  }
}
