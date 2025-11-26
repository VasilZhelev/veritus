"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Check, X, MessageSquare, Send, Bot, User } from "lucide-react";
import compareData from "@/lib/demo/compare-page-data.json";
import chatHistory from "@/lib/demo/ai-compare-chat-history.json";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <div className="markdown-content prose dark:prose-invert max-w-none text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayedText}
      </ReactMarkdown>
      {currentIndex < content.length && (
        <span className="inline-block w-[2px] h-4 bg-current ml-0.5 animate-pulse" />
      )}
    </div>
  );
}

const suggestionQuestions = [
  "Which car is better for daily commuting?",
  "What are the main differences?",
  "Which one has lower maintenance costs?",
  "Which car is more fuel efficient?",
];

export default function ComparePage() {
  // In a real app, these would be managed by global state or URL params
  const [selectedIds, setSelectedIds] = useState<string[]>(compareData.selectedIds);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedListings = compareData.listings.filter(l => selectedIds.includes(l.id));

  // Helper to get value for a specific listing
const getValue = (listing: any, key: string) => listing[key];

  useEffect(() => {
    // Scroll the chat container to the bottom
    if (chatEndRef.current) {
      const scrollContainer = chatEndRef.current.parentElement;
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleTypingComplete = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isTyping: false } : msg
      )
    );
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setUsedSuggestions(prev => new Set(prev).add(suggestion));
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Main comparison overview
    if (lowerMessage.includes("difference") || lowerMessage.includes("compare")) {
      return "**Quick snapshot:**\n\n|                     | Mercedes E220 (2006) | Škoda Fabia (2009) |\n|---------------------|----------------------|--------------------|\n| Price               | €2,965 (5,800 BGN)   | €3,502 (6,850 BGN) |\n| Mileage             | 255,323 km           | 204,800 km         |\n| Engine              | 2.2 CDI · 150 hp     | 1.9 TDI · 105 hp   |\n| Transmission        | Automatic            | Manual             |\n| Fuel economy (WLTP) | ~7.2 l/100 km        | ~5.2 l/100 km      |\n| Body type           | Executive sedan      | Compact hatchback  |\n\nThink of the Mercedes as a comfortable highway cruiser with huge interior space and classic W211 ride quality. The Fabia is the practical city warrior—cheaper to run, easier to park, and still robust thanks to the proven 1.9 TDI block.";
    }
    
    // Maintenance costs
    if (lowerMessage.includes("maintenance") || lowerMessage.includes("cost")) {
      return "**Running-cost perspective:**\n\n- **Mercedes E220**\n  - Annual servicing: €600–€900 (airmatic + transmission fluid every 60k)\n  - Insurance + tax: higher due to 2.2L engine and executive class\n  - Fuel: 7–8 l/100 km realistic mixed driving\n  - Watch list: SBC brake unit, suspension bushings, rust behind wheel arches\n\n- **Škoda Fabia**\n  - Annual servicing: €350–€500 (simple 1.9 TDI drivetrain)\n  - Insurance + tax: nearly half of the Mercedes\n  - Fuel: 5–5.5 l/100 km city/highway mix\n  - Watch list: EGR soot build-up, rear axle bushings, occasional injector seals\n\nIf total ownership cost is your top priority, the Fabia wins easily.";
    }
    
    // Fuel efficiency
    if (lowerMessage.includes("fuel") || lowerMessage.includes("efficient")) {
      return "**Fuel efficiency comparison:**\n\n- **Škoda Fabia 1.9 TDI:** ~5.2 l/100 km (city/highway mix)\n  - Smaller, lighter engine\n  - Excellent for daily commuting\n  - Realistic range: ~800-900 km per tank\n\n- **Mercedes E220 CDI:** ~7.2 l/100 km (mixed driving)\n  - Larger executive sedan with more weight\n  - Still respectable for its class\n  - Realistic range: ~700-800 km per tank\n\nThe Fabia is the clear winner here, consuming about 30-35% less fuel than the Mercedes.";
    }
    
    // Daily commuting
    if (lowerMessage.includes("commut") || lowerMessage.includes("daily")) {
      return "**Decision helper for daily commuting:**\n\n- Choose the **Mercedes** if you:\n  1. Drive longer highway stretches and want silence + cruise comfort\n  2. Don't mind spending extra on suspension and premium diesel\n  3. Appreciate classic executive styling and presence\n\n- Stick with the **Škoda** if you:\n  1. Spend most of your time in dense city traffic\n  2. Need predictable, low running costs and cheaper parts\n  3. Prefer a manual gearbox and easy parking\n\n**My neutral take:** Fabia is the sensible \"use every day, forget about it\" choice. The Mercedes becomes the right answer only if you specifically want rear-seat comfort or already budgeted for refurbishing an older executive sedan.";
    }
    
    // Default response
    return "I can help you compare these cars! Feel free to ask about:\n- Main differences and specifications\n- Maintenance and running costs\n- Fuel efficiency\n- Which is better for daily commuting";
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
      isTyping: false,
    };

    setMessages([...messages, newMessage]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        content: getAIResponse(userInput),
        timestamp: new Date().toISOString(),
        isTyping: true,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 500);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Compare Listings</h1>
        <p className="text-muted-foreground">
          Analyze features, costs, and get AI assistance to choose the right car.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Comparison Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {selectedListings.map(listing => (
              <Card key={listing.id} className="overflow-hidden border-2 border-primary/5">
                <div className="aspect-video relative bg-muted overflow-hidden">
                  <Image
                    src={listing.id === 'mercedes-e220-2006' 
                      ? 'https://mobistatic4.focus.bg/mobile/photosorg/478/1/big1/11760942424737478_wA.webp'
                      : listing.id === 'skoda-fabia-2009'
                      ? 'https://mobistatic3.focus.bg/mobile/photosorg/150/1/big1/11657564365550150_Y7.webp'
                      : ''}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg line-clamp-1" title={listing.title}>
                    {listing.title}
                  </CardTitle>
                  <CardDescription>{listing.subtitle}</CardDescription>
                  <div className="mt-2 font-bold text-xl text-primary">
                    €{listing.priceEuro.toLocaleString()}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Specs Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  { label: "Year", key: "year" },
                  { label: "Mileage", key: "mileageKm", format: (v: number) => `${v.toLocaleString()} km` },
                  { label: "Engine", key: "engine" },
                  { label: "Transmission", key: "transmission" },
                  { label: "Drive", key: "drive" },
                  { label: "Consumption", key: "consumption" },
                  { label: "Location", key: "location" },
                ].map((row) => (
                  <div key={row.label} className="grid grid-cols-3 p-4 hover:bg-muted/50 transition-colors">
                    <div className="font-medium text-muted-foreground flex items-center">{row.label}</div>
                    {selectedListings.map(listing => (
                      <div key={listing.id} className="font-medium">
                        {row.format ? row.format(getValue(listing, row.key)) : getValue(listing, row.key)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedListings.map(listing => (
              <Card key={listing.id} className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">Pros & Cons: {listing.title.split(' ')[0]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-1">
                      <Check className="h-4 w-4" /> Pros
                    </h4>
                    <ul className="text-sm space-y-1">
                      {listing.pros.map((pro: string, i: number) => (
                        <li key={i} className="text-muted-foreground">• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                      <X className="h-4 w-4" /> Cons
                    </h4>
                    <ul className="text-sm space-y-1">
                      {listing.cons.map((con: string, i: number) => (
                        <li key={i} className="text-muted-foreground">• {con}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Chat Assistant */}
        <div className="lg:col-span-1">
          <Card className="h-[calc(100vh-8rem)] flex flex-col sticky top-4 shadow-lg border-primary/10">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Veritus AI Advisor
              </CardTitle>
              <CardDescription>
                Ask for help deciding between these cars.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden relative">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3 max-w-[90%]",
                        msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={cn(
                        "rounded-lg p-3 text-sm",
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-foreground"
                      )}>
                        {msg.isTyping ? (
                          <TypingMessage
                            content={msg.content}
                            onComplete={() => handleTypingComplete(msg.id)}
                          />
                        ) : (
                          <div className="markdown-content prose dark:prose-invert max-w-none text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                        <div className={cn(
                          "text-[10px] mt-1 opacity-70",
                          msg.role === "user" ? "text-primary-foreground" : "text-muted-foreground"
                        )}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Suggestions */}
            {suggestionQuestions.filter(s => !usedSuggestions.has(s)).length > 0 && (
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  {suggestionQuestions
                    .filter(suggestion => !usedSuggestions.has(suggestion))
                    .map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-3 py-2 rounded-full bg-muted/40 hover:bg-muted/60 border border-border/30 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-[1.02] text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="p-3 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
