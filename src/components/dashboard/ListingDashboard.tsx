"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Gauge, 
  Fuel, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Send,
  Car,
  FileCheck,
  Settings,
  Sparkles,
  Globe,
  Shield,
  TrendingUp,
  Clock,
  Image as ImageIcon,
  AlertTriangle,
  XCircle,
  Wrench,
  Zap,
  CircleDot,
  Activity,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CarListing } from "@/components/ui/car-listing-card";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isTyping?: boolean;
}

// Typing animation component
function TypingMessage({ content, onComplete }: { content: string; onComplete: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 12);
      return () => clearTimeout(timeout);
    } else if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [currentIndex, content, onComplete]);

  return (
    <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
      {displayedText}
      {currentIndex < content.length && (
        <span className="inline-block w-[2px] h-4 bg-current ml-0.5 animate-pulse" />
      )}
    </div>
  );
}

// Dynamic import for the map component (client-side only)
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/ui/import-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded flex items-center justify-center text-muted-foreground text-xs">Loading Map...</div>
});

// Map component wrapper
function ImportMap({ countryCode }: { countryCode: string }) {
  return (
    <div className="relative w-full h-full">
      <LeafletMap countryCode={countryCode} />
    </div>
  );
}

const suggestionQuestions = [
  "What should I know before buying?",
  "Common issues with this model?",
  "Is the price fair?",
  "What maintenance to expect?",
];

interface ListingDashboardProps {
  listing: CarListing;
  vinInfo?: any;
}

export function ListingDashboard({ listing, vinInfo: propVinInfo }: ListingDashboardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedGallery, setSelectedGallery] = useState<"exterior" | "interior" | "engine" | "details">("exterior");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);
  const [vinInfo, setVinInfo] = useState<any>(propVinInfo || null);
  const [isLoadingVin, setIsLoadingVin] = useState(false);
  const [damageAnalysis, setDamageAnalysis] = useState<any>(null);
  const [isDamageLoading, setIsDamageLoading] = useState(false);
  const [damageError, setDamageError] = useState<string | null>(null);

  // Handle images - if listing has images array, use it. Otherwise use single image or empty array.
  const listingImages = listing.images && Array.isArray(listing.images) 
    ? listing.images 
    : listing.image 
      ? [listing.image] 
      : [];

  // Simulate different image galleries if we don't have categorized images
  // For scraped data, we usually just have a flat list of images, so we'll put them all in 'exterior'
  // or distribute them if we had logic for that. For now, let's just use the main images for exterior.
  const imageGalleries = {
    exterior: listingImages,
    interior: [], // Scraper doesn't categorize yet
    engine: [],
    details: [],
  };

  const currentImages = imageGalleries[selectedGallery].length > 0 
    ? imageGalleries[selectedGallery] 
    : selectedGallery === 'exterior' ? listingImages : [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: chatInput,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    const userInput = chatInput;
    setChatInput("");
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userInput, 
          listing,
          history: messages 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error details:", errorData);
        throw new Error(errorData.details || 'Failed to get response');
      }

      const data = await response.json();
      
      const aiResponse: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        isTyping: true,
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isTyping: true,
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      // We don't set isTyping to false here because the TypingMessage component handles it
      // when it finishes typing. However, if there was an error, we should probably clear it
      // or let the error message type out.
      // The TypingMessage component calls onComplete which sets isTyping to false.
      // So we just need to make sure the message we added has isTyping: true.
      // But if we error, we might want to ensure we don't get stuck.
      // Actually, the error message also has isTyping: true, so it will type out and then clear the flag.
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setChatInput(suggestion);
    setUsedSuggestions(prev => new Set(prev).add(suggestion));
  };

  const handleTypingComplete = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isTyping: false } : msg
      )
    );
    setIsTyping(false);
  };

  // Auto-fetch VIN info if listing has VIN but no vinInfo prop
  useEffect(() => {
    const fetchVinInfo = async () => {
      if (listing.vin && !propVinInfo && !vinInfo && !isLoadingVin) {
        setIsLoadingVin(true);
        try {
          const response = await fetch('/api/vin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vin: listing.vin }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setVinInfo(data);
          }
        } catch (error) {
          console.error('Failed to fetch VIN info:', error);
        } finally {
          setIsLoadingVin(false);
        }
      }
    };

    fetchVinInfo();
  }, [listing.vin, propVinInfo, vinInfo, isLoadingVin]);

  // Auto-fetch damage analysis if listing has images
  useEffect(() => {
    const fetchDamageAnalysis = async () => {
      if (listingImages.length > 0 && !damageAnalysis && !isDamageLoading) {
        setIsDamageLoading(true);
        setDamageError(null);
        try {
          const response = await fetch('/api/damage-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrls: listingImages }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setDamageAnalysis(data);
          } else {
            setDamageError('Failed to analyze images');
          }
        } catch (error) {
          console.error('Failed to fetch damage analysis:', error);
          setDamageError('Error analyzing images');
        } finally {
          setIsDamageLoading(false);
        }
      }
    };

    fetchDamageAnalysis();
  }, [listingImages.length, damageAnalysis, isDamageLoading]);

  const formatPrice = (price?: number | null, currency?: string | null) => {
    if (!price) return "Price not available";
    const formatted = new Intl.NumberFormat("en-US").format(price);
    return currency ? `${formatted} ${currency}` : formatted;
  };

  // VIN Logic
  const vinMileageKm = vinInfo?.details?.lastRecordedMileageKm ?? null;
  const listingMileage = listing.mileageKm || listing.mileage;
  const mileageDifference =
    listingMileage && vinMileageKm ? listingMileage - vinMileageKm : null;
  
  const mileageAssessment =
    mileageDifference === null
      ? {
          label: "Insufficient data",
          tone: "text-muted-foreground",
          description: "VIN report had no mileage entry to compare."
        }
      : mileageDifference < 0
      ? {
          label: "VIN mileage is newer",
          tone: "text-amber-600 dark:text-amber-400",
          description: "Listing mileage is lower than the last recorded reading—ask for service proof."
        }
      : mileageDifference <= 20000
      ? {
          label: "Looks consistent",
          tone: "text-green-600 dark:text-green-400",
          description: "Mileage grew as expected since the last inspection."
        }
      : {
          label: "Possible discrepancy",
          tone: "text-red-600 dark:text-red-400",
          description: "Mileage jumped a lot after the last VIN record—request maintenance logs."
        };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image Section with Title & Price Overlay */}
      <div className="relative w-full h-[65vh] min-h-[500px] max-h-[700px] overflow-hidden">
        {currentImages.length > 0 && !imageError ? (
          <div className="relative w-full h-full">
            <Image
              src={currentImages[selectedImageIndex] || currentImages[0]}
              alt={listing.title || "Car image"}
              fill
              className={cn(
                "object-cover transition-opacity duration-500",
                isImageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => {
                setIsImageLoaded(true);
                setImageError(false);
              }}
              onError={() => {
                setImageError(true);
                setIsImageLoaded(false);
              }}
              priority
              sizes="100vw"
              unoptimized
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
            
            {/* Title & Price Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
              <div className="container mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end">
                  <div>
                    <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                      {listing.title || `${listing.brand} ${listing.model}`}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-white/90 bg-black/30 backdrop-blur-sm px-3 py-1.5">
                        <MapPin className="h-4 w-4" />
                        {listing.location || "Location N/A"}
                      </div>
                      <div className="w-px h-4 bg-white/30" />
                      <div className="flex items-center gap-2 text-white/90 bg-black/30 backdrop-blur-sm px-3 py-1.5">
                        <Calendar className="h-4 w-4" />
                        {listing.postedAt || "Date N/A"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Badge */}
                  <div className="bg-primary px-8 py-4">
                    <div className="text-3xl lg:text-5xl font-bold text-primary-foreground">
                      {formatPrice(listing.price, listing.currency)}
                    </div>
                    {listing.priceLeva && (
                      <div className="text-sm text-primary-foreground/80 mt-1">
                        ≈ {formatPrice(listing.priceLeva, "BGN")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Image Navigation */}
            {currentImages.length > 1 && (
              <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                {currentImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsImageLoaded(false);
                    }}
                    className={cn(
                      "w-1 h-8 transition-all duration-200",
                      index === selectedImageIndex
                        ? "bg-white h-12"
                        : "bg-white/50 hover:bg-white/70"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-muted/20">
            <Car className="h-24 w-24 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0">
          {/* Main Content */}
          <div>
            {/* Key Specs Section - White background with colored accent bar */}
            <div className="bg-white dark:bg-card border-r border-border/50 p-8 lg:p-12 relative">
              {/* Vertical accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
              
              {/* Key Specs - Grid layout */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
                {[
                  { label: "Year", value: listing.year || "—", icon: Calendar },
                  { label: "Mileage", value: listingMileage ? `${(listingMileage / 1000).toFixed(0)}k km` : "—", icon: Gauge },
                  { label: "Engine", value: listing.attributes?.["Двигател"] || listing.fuelType || "—", icon: Fuel },
                  { label: "Transmission", value: listing.attributes?.["Скоростна кутия"] || listing.transmission || "—", icon: Settings },
                ].map(({ label, value, icon: Icon }) => (
                  <div 
                    key={label}
                    className="bg-background p-5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                      <Icon className="h-4 w-4" />
                      <div className="text-xs uppercase tracking-wider font-medium">{label}</div>
                    </div>
                    <div className="text-xl font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Gallery - Gray background with accent and clickable images */}
            {currentImages.length > 0 && (
              <div className="bg-muted/30 border-r border-border/50 p-8 lg:p-12 relative">
                {/* Colored corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent/20 to-transparent" />
                
                <h2 className="text-2xl font-bold mb-6 relative">
                  <span className="inline-block border-l-4 border-primary pl-4">Photo Gallery</span>
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {currentImages.slice(0, 8).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setGalleryImageIndex(index);
                        setIsGalleryOpen(true);
                      }}
                      className={cn(
                        "relative aspect-video overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer",
                        index === selectedImageIndex
                          ? "border-primary"
                          : "border-transparent hover:border-border"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Damage Detection - Premium feature with colored styling */}
            {listingImages.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border-r border-border/50 p-8 lg:p-12 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-transparent" />
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-600" />
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-purple-500 text-white">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">AI Damage Detection</h2>
                      <p className="text-xs text-muted-foreground">Analyzing first {Math.min(2, listingImages.length)} image(s) for visible damages</p>
                    </div>
                  </div>

                  {/* Loading State */}
                  {isDamageLoading && (
                    <div className="p-6 bg-white/80 dark:bg-background/80 backdrop-blur-sm border border-border/50 rounded flex items-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                      <span className="text-sm text-muted-foreground">Analyzing images for damages...</span>
                    </div>
                  )}

                  {/* Error State */}
                  {damageError && !isDamageLoading && (
                    <div className="p-4 bg-red-50/80 dark:bg-red-950/20 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-red-700 dark:text-red-400">Analysis Failed</div>
                        <div className="text-sm text-red-600 dark:text-red-500">{damageError}</div>
                      </div>
                    </div>
                  )}

                  {/* Results */}
                  {damageAnalysis && !isDamageLoading && (
                    <div className="space-y-6">
                      {/* Top Stats Grid - Horizontal */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Overall Condition */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
                          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="h-5 w-5" />
                              <div className="text-xs uppercase tracking-wider opacity-90">Overall Condition</div>
                            </div>
                            <div className="text-3xl font-bold mb-1">{damageAnalysis.overallCondition}</div>
                            <div className="text-xs opacity-75">{damageAnalysis.imagesAnalyzed} image{damageAnalysis.imagesAnalyzed > 1 ? 's' : ''} analyzed</div>
                          </div>
                        </div>

                        {/* Severity Level */}
                        <div className={cn(
                          "relative overflow-hidden rounded-xl p-6 text-white shadow-lg",
                          damageAnalysis.severityLevel === "none" && "bg-gradient-to-br from-green-500 to-emerald-600",
                          damageAnalysis.severityLevel === "minor" && "bg-gradient-to-br from-blue-500 to-cyan-600",
                          damageAnalysis.severityLevel === "moderate" && "bg-gradient-to-br from-orange-500 to-amber-600",
                          damageAnalysis.severityLevel === "severe" && "bg-gradient-to-br from-red-500 to-rose-600",
                          !damageAnalysis.severityLevel && "bg-gradient-to-br from-gray-500 to-slate-600"
                        )}>
                          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                              {damageAnalysis.severityLevel === "none" && <CheckCircle2 className="h-5 w-5" />}
                              {damageAnalysis.severityLevel === "minor" && <Info className="h-5 w-5" />}
                              {damageAnalysis.severityLevel === "moderate" && <AlertTriangle className="h-5 w-5" />}
                              {damageAnalysis.severityLevel === "severe" && <XCircle className="h-5 w-5" />}
                              <div className="text-xs uppercase tracking-wider opacity-90">Severity Level</div>
                            </div>
                            <div className="text-3xl font-bold">
                              {damageAnalysis.severityLevel ? damageAnalysis.severityLevel.charAt(0).toUpperCase() + damageAnalysis.severityLevel.slice(1) : "Unknown"}
                            </div>
                          </div>
                        </div>

                        {/* Damage Count */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 p-6 text-white shadow-lg">
                          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-5 w-5" />
                              <div className="text-xs uppercase tracking-wider opacity-90">Issues Detected</div>
                            </div>
                            <div className="text-3xl font-bold">{damageAnalysis.damages?.length || 0}</div>
                            <div className="text-xs opacity-75">
                              {damageAnalysis.damages?.length === 0 ? "No damages" : `Item${damageAnalysis.damages?.length > 1 ? 's' : ''} found`}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary Card */}
                      {damageAnalysis.summary && (
                        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-card p-6 shadow-md border-l-4 border-indigo-500">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-950/30">
                              <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">Assessment Summary</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{damageAnalysis.summary}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Damages Grid - Horizontal 2-Column */}
                      {damageAnalysis.damages && damageAnalysis.damages.length > 0 ? (
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                              <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold">Detected Damages</h3>
                              <p className="text-xs text-muted-foreground">{damageAnalysis.damages.length} issue{damageAnalysis.damages.length > 1 ? 's' : ''} requiring attention</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {damageAnalysis.damages.map((damage: any, index: number) => {
                              // Get damage type icon
                              const getDamageIcon = (type: string) => {
                                const t = type.toLowerCase();
                                if (t.includes('scratch')) return <Zap className="h-5 w-5" />;
                                if (t.includes('dent')) return <CircleDot className="h-5 w-5" />;
                                if (t.includes('rust')) return <AlertTriangle className="h-5 w-5" />;
                                return <Wrench className="h-5 w-5" />;
                              };

                              const severityColors = {
                                minor: "from-blue-500 to-cyan-500",
                                moderate: "from-orange-500 to-amber-500",
                                severe: "from-red-500 to-rose-500"
                              };

                              return (
                                <div 
                                  key={index}
                                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-card p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-orange-300 dark:hover:border-orange-700"
                                >
                                  {/* Gradient accent line */}
                                  <div className={cn(
                                    "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                                    damage.severity === "minor" && severityColors.minor,
                                    damage.severity === "moderate" && severityColors.moderate,
                                    damage.severity === "severe" && severityColors.severe
                                  )} />
                                  
                                  <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={cn(
                                      "flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br text-white shadow-md flex-shrink-0",
                                      damage.severity === "minor" && severityColors.minor,
                                      damage.severity === "moderate" && severityColors.moderate,
                                      damage.severity === "severe" && severityColors.severe
                                    )}>
                                      {getDamageIcon(damage.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <h4 className="font-semibold text-sm">{damage.type}</h4>
                                        <Badge 
                                          className={cn(
                                            "text-xs flex-shrink-0 font-semibold",
                                            damage.severity === "minor" && "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300",
                                            damage.severity === "moderate" && "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-300",
                                            damage.severity === "severe" && "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-300"
                                          )}
                                        >
                                          {damage.severity}
                                        </Badge>
                                      </div>
                                      
                                      <div className="mb-2">
                                        <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          {damage.location}
                                        </Badge>
                                      </div>
                                      
                                      <p className="text-xs text-muted-foreground leading-relaxed">{damage.description}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 border-l-4 border-green-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white shadow-lg">
                              <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-1">No Damages Detected</h3>
                              <p className="text-sm text-green-600 dark:text-green-400">The analyzed images show no significant visible damages or defects</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recommendations Grid */}
                      {damageAnalysis.recommendations && damageAnalysis.recommendations.length > 0 && (
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-6 border-l-4 border-purple-500">
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg flex-shrink-0">
                              <Shield className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-3">Expert Recommendations</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {damageAnalysis.recommendations.map((rec: string, index: number) => (
                                  <div key={index} className="flex items-start gap-2 text-sm bg-white/60 dark:bg-background/40 p-3 rounded-lg">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                      {index + 1}
                                    </div>
                                    <span className="text-foreground/80">{rec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Disclaimer */}
                      <div className="flex items-start gap-3 p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 dark:text-amber-200">
                          <strong>Important:</strong> This AI analysis is based solely on visible damage in the provided photos. Always conduct a thorough physical inspection and professional assessment before making any purchase decision.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full-screen Gallery Modal */}
            {isGalleryOpen && (
              <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
                <button
                  onClick={() => setIsGalleryOpen(false)}
                  className="absolute top-4 right-4 text-white hover:text-white/70 text-4xl font-light w-12 h-12 flex items-center justify-center"
                >
                  ×
                </button>
                
                {/* Previous Button */}
                {galleryImageIndex > 0 && (
                  <button
                    onClick={() => setGalleryImageIndex(galleryImageIndex - 1)}
                    className="absolute left-4 text-white hover:text-white/70 text-6xl font-light w-16 h-16 flex items-center justify-center"
                  >
                    ‹
                  </button>
                )}
                
                {/* Image */}
                <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-16">
                  <Image
                    src={currentImages[galleryImageIndex]}
                    alt={`Gallery image ${galleryImageIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    unoptimized
                  />
                </div>
                
                {/* Next Button */}
                {galleryImageIndex < currentImages.length - 1 && (
                  <button
                    onClick={() => setGalleryImageIndex(galleryImageIndex + 1)}
                    className="absolute right-4 text-white hover:text-white/70 text-6xl font-light w-16 h-16 flex items-center justify-center"
                  >
                    ›
                  </button>
                )}
                
                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded">
                  {galleryImageIndex + 1} / {currentImages.length}
                </div>
              </div>
            )}

            {/* Description - White background with accent and expand/collapse */}
            {listing.description && (
              <div className="bg-white dark:bg-card border-r border-border/50 p-8 lg:p-12 relative">
                {/* Vertical accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                
                <h2 className="text-2xl font-bold mb-6">Description</h2>
                <div className="relative">
                  <p className={cn(
                    "text-base leading-relaxed text-foreground/80 whitespace-pre-line transition-all duration-300",
                    !isDescriptionExpanded && listing.description.length > 500 && "line-clamp-6"
                  )}>
                    {listing.description}
                  </p>
                  {listing.description.length > 500 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-4 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                    >
                      {isDescriptionExpanded ? "Show Less" : "Expand Description"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Specifications - Gray background with colored header */}
            <div className="bg-muted/30 border-r border-border/50 p-8 lg:p-12 relative">
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-24 h-1 bg-gradient-to-r from-primary to-accent" />
              
              <h2 className="text-2xl font-bold mb-8">Technical Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {listing.attributes && Object.entries(listing.attributes)
                  .filter(([key]) => !["Особености", "Местоположение", "Двигател", "Скоростна кутия", "Дата на производство", "Пробег"].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 border-b border-border/30">
                      <span className="text-sm text-muted-foreground">{key}</span>
                      <span className="font-semibold">{String(value)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Features - White background with accent bar */}
            {listing.attributes?.["Особености"] && (
              <div className="bg-white dark:bg-card border-r border-border/50 p-8 lg:p-12 relative">
                {/* Vertical accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
                
                <h2 className="text-2xl font-bold mb-6">Features & Equipment</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.attributes["Особености"].split(", ").map((feature: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-1.5 h-1.5 bg-primary" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIN Information - Compact badge-style display */}
            {listing.vin && (
              <div className="bg-white dark:bg-card border-r border-border/50 p-6 lg:p-8 relative">
                {/* Accent stripe */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-600" />
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">VIN Listed</h3>
                      <Badge variant="outline" className="border-green-500/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 text-xs">
                        Verified
                      </Badge>
                    </div>
                    <div className="font-mono text-sm font-semibold text-muted-foreground mb-2">{listing.vin}</div>
                    <p className="text-xs text-muted-foreground">
                      VIN number publicly listed. {vinInfo ? 'Detailed verification below.' : isLoadingVin ? 'Checking database...' : 'Enable verification for full history.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* VIN Verification - Compact premium feature box */}
            {vinInfo && (
              <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 border-r border-border/50 p-6 lg:p-8 relative overflow-hidden">
                {/* Decorative corner elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-transparent" />
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-cyan-500 to-blue-600" />
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-blue-500 text-white">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">VIN Verification Report</h2>
                      <p className="text-xs text-muted-foreground">Database cross-reference • db.vin</p>
                    </div>
                  </div>

                  {/* VIN Display */}
                  <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-background/80 backdrop-blur-sm border border-border/50 mb-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">VIN Number</div>
                      <div className="font-mono text-base font-bold">{vinInfo.vin}</div>
                    </div>
                    {vinInfo.details?.imported ? (
                      <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 border-orange-300 dark:border-orange-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Imported
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 border-green-300 dark:border-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Domestic
                      </Badge>
                    )}
                  </div>

                  {/* Vehicle Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Make", value: vinInfo.details?.make, icon: Car },
                      { label: "Model", value: vinInfo.details?.model, icon: Car },
                      { label: "Year", value: vinInfo.details?.year, icon: Calendar },
                      { label: "Fuel", value: vinInfo.details?.fuel, icon: Fuel },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="p-3 bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-border/30">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <div className="text-xs text-muted-foreground">{label}</div>
                        </div>
                        <div className="font-semibold text-sm">{value || "—"}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mileage Verification */}
                  <div className="p-4 bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-border/30 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Mileage Check</div>
                        <div className={cn("text-base font-bold", mileageAssessment.tone)}>
                          {mileageAssessment.label}
                        </div>
                      </div>
                      {vinMileageKm && (
                        <Badge variant="secondary" className="text-xs">
                          VIN: {new Intl.NumberFormat("en-US").format(vinMileageKm)} km
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{mileageAssessment.description}</p>
                  </div>

                  {/* Import Map - Compact */}
                  {vinInfo.details?.imported && vinInfo.details?.registrationCountry && (
                    <div className="p-3 bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-border/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium">Origin: {vinInfo.details.registrationCountry}</span>
                      </div>
                      <div className="h-64 rounded overflow-hidden border border-border/30">
                        <ImportMap countryCode={vinInfo.details.registrationCountry} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats - White background with colored accents */}
            <div className="bg-white dark:bg-card border-r border-border/50 p-8 lg:p-12 relative">
              {/* Geometric accent elements */}
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-primary/30" />
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-accent/10 to-transparent" />
              
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 border border-border/30">
                  <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-lg font-bold mb-1">First Owner</div>
                  <div className="text-xs text-muted-foreground">Single ownership</div>
                </div>
                <div className="text-center p-4 border border-border/30">
                  <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-lg font-bold mb-1">Well Maintained</div>
                  <div className="text-xs text-muted-foreground">Service history</div>
                </div>
                <div className="text-center p-4 border border-border/30">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-lg font-bold mb-1">10 Years</div>
                  <div className="text-xs text-muted-foreground">Vehicle age</div>
                </div>
              </div>
            </div>

            {/* External Link - Gray background */}
            <div className="bg-muted/30 border-r border-border/50 p-8 lg:p-12 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                className="px-8 border-2"
                asChild
              >
                <a href={listing.url} target="_blank" rel="noopener noreferrer">
                  View Original Listing
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>

          {/* Sidebar - AI Assistant with colored accent */}
          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
            <div className="bg-white dark:bg-card border-l border-border/50 h-full flex flex-col overflow-hidden relative">
              {/* Top colored accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              
              {/* Header */}
              <div className="p-6 border-b border-border/30">
                <div className="flex items-center gap-3 mb-1">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">Ask anything</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Get instant insights about this car</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
                    <div className="mb-4 p-3 bg-muted/50">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Start a conversation</p>
                    <p className="text-xs text-muted-foreground/70">Ask me anything about this listing</p>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] px-4 py-3",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted border border-border"
                      )}
                    >
                      {message.isTyping ? (
                        <TypingMessage
                          content={message.content}
                          onComplete={() => handleTypingComplete(message.id)}
                        />
                      ) : (
                        <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions */}
              {suggestionQuestions.filter(s => !usedSuggestions.has(s)).length > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {suggestionQuestions
                      .filter(suggestion => !usedSuggestions.has(suggestion))
                      .map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-3 py-2 bg-muted hover:bg-muted/70 border border-border text-muted-foreground hover:text-foreground transition-colors text-left"
                        >
                          {suggestion}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-6 border-t border-border bg-muted/10">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about this car..."
                    className="flex-1 border-border bg-background"
                    disabled={isTyping}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0"
                    disabled={isTyping || !chatInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
