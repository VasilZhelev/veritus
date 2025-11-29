"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/contexts/ListingsContext";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, BookmarkCheck, Loader2, LogIn } from "lucide-react";
import { CarListing } from "@/components/ui/car-listing-card";
import { ChatMessage } from "@/lib/firestore-schema";
import { LoginDialog } from "@/components/auth/LoginDialog";

interface SaveListingButtonProps {
  listing: CarListing;
  chatHistory: ChatMessage[];
  metadata?: any;
  className?: string;
}

export function SaveListingButton({
  listing,
  chatHistory,
  metadata,
  className,
}: SaveListingButtonProps) {
  const { user } = useAuth();
  const { saveListing, unsaveListing, isListingSaved } = useListings();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Check if listing is saved on component mount
  useEffect(() => {
    if (user) {
      checkIfSaved();
    }
  }, [user, listing.id]);

  const checkIfSaved = async () => {
    if (!user) return;
    const saved = await isListingSaved(listing.id);
    setIsSaved(saved);
  };

  const handleSaveToggle = async () => {
    if (!user) {
      // Show login dialog if not authenticated
      setShowLoginDialog(true);
      return;
    }

    setLoading(true);

    try {
      if (isSaved) {
        await unsaveListing(listing.id);
        setIsSaved(false);
        setLastSaved(null);
      } else {
        await saveListing(listing, chatHistory, metadata);
        setIsSaved(true);
        setLastSaved(new Date().toISOString());
      }
    } catch (error) {
      console.error("Error toggling save status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save chat history when it changes (if already saved)
  useEffect(() => {
    if (user && isSaved && chatHistory.length > 0) {
      const autoSave = async () => {
        try {
          await saveListing(listing, chatHistory, metadata);
          setLastSaved(new Date().toISOString());
        } catch (error) {
          console.error("Auto-save error:", error);
        }
      };

      // Debounce auto-save
      const timer = setTimeout(autoSave, 2000);
      return () => clearTimeout(timer);
    }
  }, [chatHistory, isSaved, user]);

  const formatLastSaved = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return "saved just now";
    if (minutes < 60) return `saved ${minutes}m ago`;
    return `saved at ${date.toLocaleTimeString()}`;
  };

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLoginDialog(true)}
          className={className}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign in to Save
        </Button>
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={isSaved ? "default" : "outline"}
        size="sm"
        onClick={handleSaveToggle}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : isSaved ? (
          <BookmarkCheck className="h-4 w-4 mr-2" />
        ) : (
          <BookmarkPlus className="h-4 w-4 mr-2" />
        )}
        {isSaved ? "Saved" : "Save Listing"}
      </Button>
      {isSaved && lastSaved && (
        <span className="text-xs text-muted-foreground text-center">
          {formatLastSaved(lastSaved)}
        </span>
      )}
    </div>
  );
}
