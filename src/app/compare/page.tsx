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
    <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
      {displayedText}
      {currentIndex < content.length && (
        <span className="inline-block w-[2px] h-4 bg-current ml-0.5 animate-pulse" />
      )}
    </div>
  );
}

export default function ComparePage() {
  const { listings, compareSelection } = useListings();
  const [selectedListings, setSelectedListings] = useState<CarListing[]>([]);
  const { t } = useLanguage();
  
  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filter listings based on selection
    const selected = listings.filter(l => compareSelection.includes(l.id));
    setSelectedListings(selected);
  }, [listings, compareSelection]);

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
          history: messages 
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
                  <Image src={car1.image} alt={car1.title || "Car 1"} fill className="object-cover" />
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
                  <Image src={car2.image} alt={car2.title || "Car 2"} fill className="object-cover" />
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
          <Card>
            <CardHeader className="pb-4 border-b">
              <h3 className="font-semibold">{t('compare.specifications')}</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  { icon: Calendar, label: t('compare.year'), val1: car1.year, val2: car2.year },
                  { icon: Gauge, label: t('compare.mileage'), val1: formatMileage(car1.mileage), val2: formatMileage(car2.mileage) },
                  { icon: Fuel, label: t('compare.fuel'), val1: car1.fuelType, val2: car2.fuelType },
                  { icon: Settings, label: t('compare.transmission'), val1: car1.transmission, val2: car2.transmission },
                  { icon: MapPin, label: t('compare.location'), val1: car1.location, val2: car2.location },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 py-4 px-6 hover:bg-muted/50 transition-colors">
                    <div className="col-span-3 sm:col-span-1 flex items-center gap-2 text-muted-foreground mb-2 sm:mb-0">
                      <row.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{row.label}</span>
                    </div>
                    <div className="font-medium">{row.val1 || "-"}</div>
                    <div className="font-medium">{row.val2 || "-"}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

             <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
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
