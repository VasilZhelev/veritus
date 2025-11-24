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

export default function ComparePage() {
  // In a real app, these would be managed by global state or URL params
  const [selectedIds, setSelectedIds] = useState<string[]>(compareData.selectedIds);
  const [messages, setMessages] = useState<ChatMessage[]>(
    chatHistory.messages.map(msg => ({ ...msg, isTyping: false, role: msg.role as "user" | "assistant" }))
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedListings = compareData.listings.filter(l => selectedIds.includes(l.id));

  // Helper to get value for a specific listing
const getValue = (listing: any, key: string) => listing[key];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Automatically show messages with typing effect on mount
  useEffect(() => {
    if (chatHistory.messages.length > 0) {
      const loadMessages = async () => {
        const allMessages: ChatMessage[] = [];
        
        for (let i = 0; i < chatHistory.messages.length; i++) {
          const msg = chatHistory.messages[i] as ChatMessage;
          
          if (msg.role === "user") {
            // Add user messages instantly
            allMessages.push({ ...msg, isTyping: false });
            setMessages([...allMessages]);
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            // Add assistant messages with typing animation
            setIsTyping(true);
            allMessages.push({ ...msg, isTyping: true });
            setMessages([...allMessages]);
            
            // Wait for typing to complete (estimated time based on content length)
            await new Promise(resolve => setTimeout(resolve, msg.content.length * 12 + 500));
            
            // Mark as completed
            allMessages[allMessages.length - 1] = { ...msg, isTyping: false };
            setMessages([...allMessages]);
            setIsTyping(false);
            
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      };
      
      loadMessages();
    }
  }, []);

  const handleTypingComplete = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isTyping: false } : msg
      )
    );
    setIsTyping(false);
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
    setInput("");
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        content: "This is a demo interaction. In the full version, I would analyze your specific question about these cars.",
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
