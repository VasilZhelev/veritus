"use client";

import { useEffect, useState, useRef } from "react";
import { useListings } from "@/contexts/ListingsContext";
import { CarListing } from "@/components/ui/car-listing-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Sparkles, 
  Send, 
  Check, 
  X,
  Calendar,
  Fuel,
  Gauge,
  Settings,
  MapPin
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/components/dashboard/ListingDashboard";
import { useLanguage } from "@/contexts/LanguageContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Typing animation component (reused)
function TypingMessage({ content, onComplete }: { content: string; onComplete: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 8); // Slightly faster for comparison
      return () => clearTimeout(timeout);
    } else if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [currentIndex, content, onComplete]);

  return (
    <div className="leading-relaxed break-words">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          strong: ({node, ...props}) => <span className="font-bold" {...props} />,
          em: ({node, ...props}) => <span className="italic" {...props} />,
          p: ({node, ...props}) => <div className="mb-2 last:mb-0" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
          li: ({node, ...props}) => <li className="mb-1" {...props} />
        }}
      >
        {displayedText + (currentIndex < content.length ? " █" : "")}
      </ReactMarkdown>
    </div>
  );
}

export default function ComparePage() {
  const { listings, compareSelection } = useListings();
  const [selectedListings, setSelectedListings] = useState<CarListing[]>([]);
  const { t, language } = useLanguage();
  
  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filter listings based on selection
    const selected = listings.filter(l => compareSelection.includes(l.id));
    setSelectedListings(selected);
  }, [listings, compareSelection]);

  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
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
      const response = await fetch('/api/compare-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userInput, 
          listings: selectedListings,
          history: messages,
          language
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
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
        content: t('dashboard.chatError'),
        timestamp: new Date().toISOString(),
        isTyping: true,
      };
      setMessages((prev) => [...prev, errorResponse]);
    }
  };

  const handleTypingComplete = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isTyping: false } : msg
      )
    );
    setIsTyping(false);
  };

  if (selectedListings.length < 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('compare.selectTwo')}</h1>
        <Button asChild>
          <Link href="/listings">{t('compare.goToListings')}</Link>
        </Button>
      </div>
    );
  }

  const [car1, car2] = selectedListings;

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("bg-BG", { style: "currency", currency: currency || "EUR" }).format(price);
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return "N/A";
    return `${new Intl.NumberFormat("bg-BG").format(mileage)} km`;
  };

  const excludedAttributes = [
    "id", "url", "image", "brand", "model", "year", "price", "currency",
    "mileage", "fuelType", "transmission", "location", "description",
    "createdAt", "source", "title", "priceText", "mileageText", "yearText",
    "rawDetails", "images", "postedAt", "vin",
    "Особености",
    "Състояние"
  ];

  const extractNumber = (str: any): number | null => {
    if (typeof str === 'number') return str;
    if (!str) return null;
    const matches = String(str).match(/[\d\.]+/g);
    return matches ? parseFloat(matches.join('')) : null;
  };

  const allDynamicKeys = new Set<string>();
  if (car1.attributes) Object.keys(car1.attributes).forEach(k => !excludedAttributes.includes(k) && allDynamicKeys.add(k));
  if (car2.attributes) Object.keys(car2.attributes).forEach(k => !excludedAttributes.includes(k) && allDynamicKeys.add(k));
  
  const dynamicAttributes = Array.from(allDynamicKeys).sort();

  const getWinnerClass = (val1: any, val2: any, type: "lower" | "higher") => {
    const num1 = extractNumber(val1);
    const num2 = extractNumber(val2);
    if (num1 === null || num2 === null || num1 === num2) return "";
    
    if (type === "lower") {
      return num1 < num2 ? "bg-green-100/80 text-green-800 dark:bg-green-900/40 dark:text-green-400 shadow-inner ring-1 ring-inset ring-green-500/20 font-bold" : "";
    } else {
      return num1 > num2 ? "bg-green-100/80 text-green-800 dark:bg-green-900/40 dark:text-green-400 shadow-inner ring-1 ring-inset ring-green-500/20 font-bold" : "";
    }
  };

  const tSafe = (key: string, fallback: string) => t(key) === key ? fallback : t(key);

  const checkDamage = (val?: string) => {
    if (!val) return "";
    const lower = val.toLowerCase();
    return (lower.includes("повреден") || lower.includes("ударен")) 
      ? "bg-red-100/90 text-red-800 dark:bg-red-950/60 dark:text-red-400 shadow-inner ring-2 ring-inset ring-red-500/80 font-bold uppercase tracking-wider" 
      : "";
  };

  const specRows = [
    { 
      label: tSafe('compare.condition', "Състояние"), 
      val1: car1.attributes?.["Състояние"] || "-", 
      val2: car2.attributes?.["Състояние"] || "-", 
      class1: checkDamage(car1.attributes?.["Състояние"]), 
      class2: checkDamage(car2.attributes?.["Състояние"]) 
    },
    { label: tSafe('compare.price', "Price"), val1: formatPrice(car1.price, car1.currency) || "-", val2: formatPrice(car2.price, car2.currency) || "-", class1: getWinnerClass(car1.price, car2.price, "lower"), class2: getWinnerClass(car2.price, car1.price, "lower") },
    { label: tSafe('compare.year', "Year"), val1: car1.year || "-", val2: car2.year || "-", class1: getWinnerClass(car1.year, car2.year, "higher"), class2: getWinnerClass(car2.year, car1.year, "higher") },
    { label: tSafe('compare.mileage', "Mileage"), val1: formatMileage(car1.mileage) || "-", val2: formatMileage(car2.mileage) || "-", class1: getWinnerClass(car1.mileage, car2.mileage, "lower"), class2: getWinnerClass(car2.mileage, car1.mileage, "lower") },
    { label: tSafe('compare.transmission', "Transmission"), val1: car1.transmission || "-", val2: car2.transmission || "-", class1: "", class2: "" },
    ...dynamicAttributes.map(key => {
      const v1 = car1.attributes?.[key];
      const v2 = car2.attributes?.[key];
      let isHigherBetter = false;
      let isLowerBetter = false;
      if (key === "Двигател" || key === "Мощност" || key.toLowerCase().includes("к.с.")) isHigherBetter = true;
      if (key === "Ускорение" || key.toLowerCase().includes("0-100")) isLowerBetter = true;
      
      return {
        label: key,
        val1: v1 || "-",
        val2: v2 || "-",
        class1: isHigherBetter ? getWinnerClass(v1, v2, "higher") : isLowerBetter ? getWinnerClass(v1, v2, "lower") : "",
        class2: isHigherBetter ? getWinnerClass(v2, v1, "higher") : isLowerBetter ? getWinnerClass(v2, v1, "lower") : "",
      };
    })
  ].filter(row => row.val1 !== "-" || row.val2 !== "-");

  const getFeatures = (car: CarListing) => {
    const fStr = car.attributes?.["Особености"] || "";
    return fStr.split(',').map((f: string) => f.trim()).filter(Boolean);
  };
  
  const features1 = new Set<string>(getFeatures(car1));
  const features2 = new Set<string>(getFeatures(car2));
  const allFeatures: string[] = Array.from(new Set<string>([...features1, ...features2])).sort();

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/listings">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">{t('compare.title')}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Comparison Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            {/* Car 1 Header */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                {car1.image ? (
                  <Image src={car1.image!} alt={car1.title || "Car 1"} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold line-clamp-2 h-14">{car1.brand} {car1.model}</h2>
                <Badge variant="secondary" className="text-lg px-3 py-1 mt-2">
                  {formatPrice(car1.price, car1.currency)}
                </Badge>
              </div>
            </div>

            {/* Car 2 Header */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                {car2.image ? (
                  <Image src={car2.image!} alt={car2.title || "Car 2"} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold line-clamp-2 h-14">{car2.brand} {car2.model}</h2>
                <Badge variant="secondary" className="text-lg px-3 py-1 mt-2">
                  {formatPrice(car2.price, car2.currency)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Specs Comparison */}
          <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-4 border-b bg-muted/30">
              <h3 className="font-semibold text-lg">{t('compare.specifications') || "Head-to-Head Specifications"}</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {specRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-3 hover:bg-muted/30 transition-colors">
                    <div className="col-span-1 flex items-center py-4 px-4 sm:px-6 text-sm font-semibold tracking-tight text-muted-foreground bg-muted/10 border-r border-border/50">
                      {row.label}
                    </div>
                    <div className={cn("col-span-1 py-4 px-4 sm:px-6 font-medium text-sm flex items-center transition-colors", row.class1)}>
                      {row.val1}
                    </div>
                    <div className={cn("col-span-1 py-4 px-4 sm:px-6 font-medium text-sm flex items-center border-l bg-white/30 dark:bg-background/20 transition-colors", row.class2)}>
                      {row.val2}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features Diff */}
          {allFeatures.length > 0 && (
            <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-4 border-b bg-muted/30">
                <h3 className="font-semibold text-lg">Features & Options</h3>
                <p className="text-xs text-muted-foreground">What one car has that the other might not.</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
                  {allFeatures.map((feature, i) => {
                    const has1 = features1.has(feature);
                    const has2 = features2.has(feature);
                    return (
                      <div key={i} className="grid grid-cols-3 hover:bg-muted/30 transition-colors">
                        <div className="col-span-1 flex items-center py-3 px-4 sm:px-6 text-sm font-medium text-muted-foreground bg-muted/10 border-r border-border/50">
                          {feature}
                        </div>
                        <div className={cn("col-span-1 py-3 px-4 sm:px-6 flex items-center justify-center", has1 ? "bg-green-50/20 dark:bg-green-900/10 text-green-600 dark:text-green-400" : "bg-red-50/20 dark:bg-red-900/10 text-muted-foreground/30")}>
                          {has1 ? <Check className="h-5 w-5" /> : <X className="h-4 w-4" />}
                        </div>
                        <div className={cn("col-span-1 py-3 px-4 sm:px-6 flex items-center justify-center border-l", has2 ? "bg-green-50/20 dark:bg-green-900/10 text-green-600 dark:text-green-400" : "bg-red-50/20 dark:bg-red-900/10 text-muted-foreground/30")}>
                          {has2 ? <Check className="h-5 w-5" /> : <X className="h-4 w-4" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Chat Sidebar */}
        <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
          <div className="bg-card border border-border rounded-xl shadow-lg h-full flex flex-col overflow-hidden relative">
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
             
             <div className="p-4 border-b bg-muted/30">
               <div className="flex items-center gap-2 mb-1">
                 <Sparkles className="h-5 w-5 text-purple-500" />
                 <h3 className="font-bold">AI Comparison Assistant</h3>
               </div>
               <p className="text-xs text-muted-foreground">Ask me to help you choose between these two.</p>
             </div>

             <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-10 px-4">
                    <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full w-fit mx-auto mb-3">
                      <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm font-medium mb-1">Not sure which one to pick?</p>
                    <p className="text-xs text-muted-foreground">I can analyze the price, mileage, and specs to give you a recommendation.</p>
                    
                    <div className="mt-6 space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs justify-start h-auto py-2 whitespace-normal text-left"
                        onClick={() => {
                           setChatInput("Which car is the better value for money?");
                           // Ideally trigger send immediately, but for now just fill input
                        }}
                      >
                        "Which car is better value?"
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs justify-start h-auto py-2 whitespace-normal text-left"
                        onClick={() => setChatInput("Compare their maintenance costs.")}
                      >
                        "Compare maintenance costs"
                      </Button>
                    </div>
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
                        "max-w-[90%] px-3 py-2 rounded-2xl text-sm shadow-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted border border-border rounded-bl-none"
                      )}
                    >
                      {message.isTyping ? (
                        <TypingMessage
                          content={message.content}
                          onComplete={() => handleTypingComplete(message.id)}
                        />
                      ) : (
                        <div className="leading-relaxed break-words">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                              em: ({node, ...props}) => <span className="italic" {...props} />,
                              p: ({node, ...props}) => <div className="mb-2 last:mb-0" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                              li: ({node, ...props}) => <li className="mb-1" {...props} />
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
             </div>

             <form onSubmit={handleSendMessage} className="p-3 border-t bg-muted/10">
               <div className="flex gap-2">
                 <Input
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   placeholder="Ask for a recommendation..."
                   className="flex-1 rounded-full text-sm"
                   disabled={isTyping}
                 />
                 <Button
                   type="submit"
                   size="icon"
                   className="shrink-0 rounded-full h-9 w-9"
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
  );
}
