"use client";

import { CarListingCard } from "@/components/ui/car-listing-card";
import { useListings } from "@/contexts/ListingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Trash2, Car, Plus, Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useState } from "react";
import { LogIn, Cloud } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

export default function ListingsPage() {
  const { listings, removeListing, clearListings, toggleLike, compareSelection, toggleCompare, isInCompare, clearCompare } = useListings();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<{ id: string; title: string } | null>(null);

  const filteredListings = showLikedOnly
    ? listings.filter((l) => l.likedAt)
    : listings;

  const handleDeleteClick = (id: string, title: string) => {
    setListingToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (listingToDelete) {
      await removeListing(listingToDelete.id);
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                  <Car className="h-8 w-8" />
                  {t("listings.title")}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {filteredListings.length === 0
                    ? t("listings.empty")
                    : t("listings.count", { count: filteredListings.length })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {listings.length > 0 && (
                  <Button
                    variant={showLikedOnly ? "secondary" : "outline"}
                    onClick={() => setShowLikedOnly(!showLikedOnly)}
                    className={cn("flex items-center gap-2", showLikedOnly && "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400")}
                  >
                    <Heart className={cn("h-4 w-4", showLikedOnly && "fill-current")} />
                    {showLikedOnly ? "Show All" : "Liked Only"}
                  </Button>
                )}
                
                {listings.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={clearListings}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("listings.clearAll")}
                    </Button>
                    <Button asChild className="flex items-center gap-2">
                      <Link href="/">
                        <Plus className="h-4 w-4" />
                        {t("listings.addListing")}
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Auth Prompt for Local Listings */}
            {!user && listings.length > 0 && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Cloud className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Save your listings to the cloud</h3>
                    <p className="text-sm text-muted-foreground">Sign in to access your listings and chat history from any device.</p>
                  </div>
                </div>
                <Button onClick={() => setShowLoginDialog(true)} size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In to Sync
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          listingTitle={listingToDelete?.title || "this listing"}
        />

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 rounded-full bg-muted p-6">
              <Car className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {showLikedOnly ? "No liked listings found" : t("listings.noListings")}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {showLikedOnly ? "You haven't liked any listings yet." : t("listings.emptyDescription")}
            </p>
            {!showLikedOnly && (
              <Button asChild size="lg" className="flex items-center gap-2">
                <Link href="/">
                  <Plus className="h-4 w-4" />
                  {t("listings.addFirst")}
                </Link>
              </Button>
            )}
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
            {filteredListings.map((listing) => (
              <CarListingCard
                key={listing.id}
                listing={listing}
                onDelete={() => handleDeleteClick(listing.id, `${listing.brand} ${listing.model}`)}
                onToggleLike={() => toggleLike(listing.id)}
                onToggleCompare={toggleCompare}
                isSelectedForCompare={isInCompare(listing.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Compare Floating Action Bar */}
      {compareSelection.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-foreground text-background rounded-full shadow-2xl px-6 py-3 flex items-center gap-6 border border-border/20">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {compareSelection.length}
              </div>
              <span className="font-medium text-sm sm:text-base">
                {compareSelection.length === 1 ? "Car selected" : "Cars selected"}
              </span>
            </div>
            
            <div className="h-6 w-px bg-background/20" />
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCompare}
                className="text-background/70 hover:text-background hover:bg-background/10 h-8 px-3 rounded-full"
              >
                Clear
              </Button>
              <Button 
                size="sm" 
                disabled={compareSelection.length < 2}
                asChild={compareSelection.length >= 2}
                className={cn(
                  "rounded-full px-4 h-8 transition-all",
                  compareSelection.length >= 2 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-muted/20 text-muted-foreground cursor-not-allowed"
                )}
              >
                {compareSelection.length >= 2 ? (
                  <Link href="/compare">
                    Compare Now
                  </Link>
                ) : (
                  <span>Select 2 to Compare</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

