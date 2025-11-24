"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
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
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import singleListingData from "@/lib/demo/single-listing.json";
import vinData from "@/lib/demo/vin-checker-output.json";

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

// Map component for import location
function ImportMap({ countryCode }: { countryCode: string }) {
  // Map country codes to coordinates (simplified)
  const countryCoords: Record<string, { lat: number; lng: number; name: string }> = {
    DE: { lat: 51.1657, lng: 10.4515, name: "Germany" },
    FR: { lat: 46.2276, lng: 2.2137, name: "France" },
    IT: { lat: 41.8719, lng: 12.5674, name: "Italy" },
    UK: { lat: 55.3781, lng: -3.4360, name: "United Kingdom" },
    BG: { lat: 42.7339, lng: 25.4858, name: "Bulgaria" },
  };

  const location = countryCoords[countryCode] || countryCoords.DE;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 2}%2C${location.lat - 2}%2C${location.lng + 2}%2C${location.lat + 2}&layer=mapnik&marker=${location.lat}%2C${location.lng}`;

  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-border/30 bg-muted/20">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapUrl}
        className="absolute inset-0"
      />
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 shadow-lg">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Imported from {location.name}</span>
        </div>
      </div>
    </div>
  );
}

const suggestionQuestions = [
  "What should I know before buying?",
  "Common issues with this model?",
  "Is the price fair?",
  "What maintenance to expect?",
];

export default function ListingPage() {
  const params = useParams();
  const listing = singleListingData;
  const vinInfo = vinData;
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedGallery, setSelectedGallery] = useState<"exterior" | "interior" | "engine" | "details">("exterior");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Simulate different image galleries
  const imageGalleries = {
    exterior: listing.images || [],
    interior: [
      "https://example.com/images/vw-golf-interior-1.jpg",
      "https://example.com/images/vw-golf-interior-2.jpg",
      "https://example.com/images/vw-golf-interior-3.jpg",
    ],
    engine: [
      "https://example.com/images/vw-golf-engine-1.jpg",
      "https://example.com/images/vw-golf-engine-2.jpg",
    ],
    details: [
      "https://example.com/images/vw-golf-details-1.jpg",
      "https://example.com/images/vw-golf-details-2.jpg",
      "https://example.com/images/vw-golf-details-3.jpg",
    ],
  };

  const currentImages = imageGalleries[selectedGallery] || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("price") || lowerMessage.includes("fair") || lowerMessage.includes("cost")) {
      return "The price of €12,500 for a 2014 Golf 2.0 TDI Highline with 145,000 km sits in the reasonable range. Similar models typically range from €11,000-€14,000. The Highline trim adds value with premium features. Consider negotiating down to €11,500-€12,000 if inspection reveals any issues.";
    }
    
    if (lowerMessage.includes("issue") || lowerMessage.includes("problem") || lowerMessage.includes("common")) {
      return "Common issues with the 2014 Volkswagen Golf 2.0 TDI:\n\nEngine-related:\n• DPF (Diesel Particulate Filter) clogging, especially with city driving\n• EGR valve issues causing reduced performance\n• Timing belt replacement critical around 120,000-150,000 km\n\nMaintenance:\n• Service intervals are important - verify all scheduled maintenance was done\n• Parts are readily available but can be expensive for genuine VW parts\n\nGiven the mileage, I'd strongly recommend a pre-purchase inspection by a qualified mechanic.";
    }
    
    if (lowerMessage.includes("know") || lowerMessage.includes("before") || lowerMessage.includes("buy")) {
      return "Based on the listing details, here's what you should know about this 2014 Volkswagen Golf 2.0 TDI:\n\nPros:\n• Well-maintained with service history\n• Popular model with good parts availability\n• Diesel engine offers good fuel economy\n• Highline trim includes premium features\n• First owner, which is a positive sign\n\nThings to check:\n• At 145,000 km, verify timing belt replacement (typically due around 120,000-150,000 km)\n• Check for any diesel particulate filter (DPF) issues\n• Verify all service records, especially for the 2.0 TDI engine\n• Have a mechanic inspect the vehicle, especially since it's imported from Germany.";
    }
    
    if (lowerMessage.includes("maintenance") || lowerMessage.includes("service") || lowerMessage.includes("repair")) {
      return "Maintenance considerations for this 2014 Golf 2.0 TDI:\n\nImmediate checks:\n• Timing belt replacement due around 120,000-150,000 km (currently at 145k)\n• DPF system health check\n• EGR valve inspection\n\nOngoing costs:\n• Service: €200-€400 per year\n• Parts: Readily available, moderate pricing\n• Timing belt replacement: €400-€600\n\nRecommendation:\nVerify all service records and factor in potential maintenance costs when negotiating the price.";
    }
    
    return "I can help you with questions about this car's price, common issues, maintenance, or what to check before buying. Feel free to ask!";
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: chatInput,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, newMessage]);
    const userInput = chatInput;
    setChatInput("");
    setIsTyping(true);
    
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: getAIResponse(userInput),
        timestamp: new Date().toISOString(),
        isTyping: true,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 500);
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

  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price) return "Price not available";
    const formatted = new Intl.NumberFormat("en-US").format(price);
    return currency ? `${formatted} ${currency}` : formatted;
  };

  const vinMileageKm = vinInfo.details.lastRecordedMileageKm ?? null;
  const mileageDifference =
    listing.mileageKm && vinMileageKm ? listing.mileageKm - vinMileageKm : null;
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
      {/* Hero Image Section */}
      <div className="relative w-full h-[60vh] min-h-[500px] max-h-[700px] overflow-hidden">
        {currentImages.length > 0 && !imageError ? (
          <div className="relative w-full h-full">
            <Image
              src={currentImages[selectedImageIndex] || currentImages[0]}
              alt={listing.title || "Car image"}
              fill
              className={cn(
                "object-cover transition-all duration-700 ease-out",
                isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
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
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            
            {/* Image Navigation */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {currentImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsImageLoaded(false);
                    }}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      index === selectedImageIndex
                        ? "bg-white w-8"
                        : "bg-white/40 hover:bg-white/60 w-1.5"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-muted/30 to-muted/10">
            <Car className="h-32 w-32 text-muted-foreground/30 mb-4" />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="space-y-12">
            {/* Header Section */}
            <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-xl border border-border/50">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-6 text-muted-foreground mb-6">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {listing.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {listing.postedAt}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-6">
                  <div className="text-4xl lg:text-5xl font-bold text-primary mb-1">
                    {formatPrice(listing.price, listing.currency)}
                  </div>
                  {listing.priceLeva && (
                    <div className="text-lg text-muted-foreground">
                      ≈ {formatPrice(listing.priceLeva, "BGN")}
                    </div>
                  )}
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border/50">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Year</div>
                  <div className="text-2xl font-semibold">{listing.year || "—"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Mileage</div>
                  <div className="text-2xl font-semibold">
                    {listing.mileageKm ? `${(listing.mileageKm / 1000).toFixed(0)}k km` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Engine</div>
                  <div className="text-lg font-semibold">
                    {listing.attributes["Двигател"]?.split(" / ")[0] || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Transmission</div>
                  <div className="text-lg font-semibold">
                    {listing.attributes["Скоростна кутия"] || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery Selector */}
            <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-border/30">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Photo Gallery</h2>
              </div>
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {[
                  { key: "exterior" as const, label: "Exterior", count: imageGalleries.exterior.length },
                  { key: "interior" as const, label: "Interior", count: imageGalleries.interior.length },
                  { key: "engine" as const, label: "Engine", count: imageGalleries.engine.length },
                  { key: "details" as const, label: "Details", count: imageGalleries.details.length },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedGallery(key);
                      setSelectedImageIndex(0);
                      setIsImageLoaded(false);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                      selectedGallery === key
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted/70"
                    )}
                  >
                    {label} <span className="opacity-70">({count})</span>
                  </button>
                ))}
              </div>
              {currentImages.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {currentImages.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setIsImageLoaded(false);
                      }}
                      className={cn(
                        "relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105",
                        index === selectedImageIndex
                          ? "border-primary ring-2 ring-primary/20 shadow-md"
                          : "border-border/30 opacity-70 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${selectedGallery} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 20vw"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-lg border border-border/30">
                <h2 className="text-2xl font-semibold mb-6">Description</h2>
                <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-lg border border-border/30">
              <h2 className="text-2xl font-semibold mb-8">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(listing.attributes)
                  .filter(([key]) => !["Особености", "Местоположение", "Двигател", "Скоростна кутия", "Дата на производство", "Пробег"].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 border-b border-border/20">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Features */}
            {listing.attributes["Особености"] && (
              <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-lg border border-border/30">
                <h2 className="text-2xl font-semibold mb-6">Features & Equipment</h2>
                <div className="flex flex-wrap gap-3">
                  {listing.attributes["Особености"].split(", ").map((feature, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full bg-muted/50 text-sm font-medium border border-border/30"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* VIN Verification with Map */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-lg border border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">VIN Verification</h2>
                  <p className="text-sm text-muted-foreground">Vehicle identification & origin</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/30">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">VIN Number</div>
                    <div className="font-mono text-lg font-semibold">{vinInfo.vin}</div>
                  </div>
                  {vinInfo.details.imported ? (
                    <Badge variant="outline" className="border-orange-500/50 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded-full px-3">
                      <AlertCircle className="h-3 w-3 mr-1.5" />
                      Imported
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-500/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-full px-3">
                      <CheckCircle2 className="h-3 w-3 mr-1.5" />
                      Domestic
                    </Badge>
                  )}
                </div>

                {/* Map */}
                {vinInfo.details.imported && vinInfo.details.registrationCountry && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Origin Location</span>
                    </div>
                    <ImportMap countryCode={vinInfo.details.registrationCountry} />
                  </div>
                )}
                
                {/* Mileage check */}
                <div className="p-5 rounded-2xl bg-background/70 border border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Mileage check</div>
                      <div className={cn("text-lg font-semibold", mileageAssessment.tone)}>
                        {mileageAssessment.label}
                      </div>
                    </div>
                    {vinMileageKm && (
                      <Badge variant="secondary" className="rounded-full">
                        VIN: {new Intl.NumberFormat("en-US").format(vinMileageKm)} km
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{mileageAssessment.description}</p>
                  {mileageDifference !== null && (
                    <div className="mt-3 text-xs text-muted-foreground/80">
                      Last record: {vinInfo.details.lastRecordedDate ?? "—"} · Difference:{" "}
                      {new Intl.NumberFormat("en-US").format(Math.abs(mileageDifference))} km
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Make", value: vinInfo.details.make, icon: Car },
                    { label: "Model", value: vinInfo.details.model, icon: Car },
                    { label: "Year", value: vinInfo.details.year, icon: Calendar },
                    { label: "Fuel Type", value: vinInfo.details.fuel, icon: Fuel },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="p-4 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
                      </div>
                      <div className="font-semibold">{value || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-border/30 text-center">
                <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold mb-1">First Owner</div>
                <div className="text-xs text-muted-foreground">Single ownership</div>
              </div>
              <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-border/30 text-center">
                <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold mb-1">Well Maintained</div>
                <div className="text-xs text-muted-foreground">Service history</div>
              </div>
              <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-border/30 text-center">
                <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold mb-1">10 Years</div>
                <div className="text-xs text-muted-foreground">Vehicle age</div>
              </div>
            </div>

            {/* External Link */}
            <div className="flex justify-center pb-8">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 border-2"
                asChild
              >
                <a href={listing.url} target="_blank" rel="noopener noreferrer">
                  View Original Listing
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>

          {/* Sidebar - AI Assistant */}
          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
            <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-xl border border-border/50 h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-border/30">
                <div className="flex items-center gap-3 mb-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
                    <Sparkles className="h-5 w-5 text-accent relative z-10" />
                  </div>
                  <h3 className="text-xl font-semibold">Ask anything</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Get instant insights about this car</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted/50 [&::-webkit-scrollbar-track]:bg-transparent">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
                    <div className="mb-6 p-4 rounded-2xl bg-accent/5">
                      <Sparkles className="h-10 w-10 text-accent" />
                    </div>
                    <p className="text-muted-foreground mb-2">Start a conversation</p>
                    <p className="text-sm text-muted-foreground/70">Ask me anything about this listing</p>
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
                        "max-w-[85%] rounded-2xl px-5 py-4",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted/60 text-foreground rounded-bl-md"
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
                          className="text-xs px-4 py-2 rounded-full bg-muted/40 hover:bg-muted/60 border border-border/30 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-[1.02] text-left"
                        >
                          {suggestion}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-6 border-t border-border/30 bg-muted/20">
                <div className="flex gap-3">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about this car..."
                    className="flex-1 rounded-full border-border/50 bg-background/50 backdrop-blur-sm"
                    disabled={isTyping}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full shrink-0"
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
