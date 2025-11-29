"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles,
  Send,
  Car,
  Wrench,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CarListing } from "@/components/ui/car-listing-card";
import { ListingHeader } from "./ListingHeader";
import { SaveListingButton } from "./SaveListingButton";
import { useListings } from "@/contexts/ListingsContext";
import { useAuth } from "@/contexts/AuthContext";
import dynamic from "next/dynamic";

// Lazy load tab components for optimization
const MainInfoTab = dynamic(() => import("./tabs/MainInfoTab"), {
  loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
});
const DamageDetectionTab = dynamic(() => import("./tabs/DamageDetectionTab"), {
  loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-purple-500 border-t-transparent rounded-full" /></div>
});
const VinCheckupTab = dynamic(() => import("./tabs/VinCheckupTab"), {
  loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-green-500 border-t-transparent rounded-full" /></div>
});

export interface ChatMessage {
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

type TabType = "main" | "damage" | "vin";

export function ListingDashboard({ listing, vinInfo: propVinInfo }: ListingDashboardProps) {
  const { user } = useAuth();
  const { getSavedListingWithChat, toggleLike } = useListings();
  const [activeTab, setActiveTab] = useState<TabType>("main");
  
  // Chat State (Persistent across tabs)
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load saved chat history on mount
  useEffect(() => {
    if (user) {
      const savedListing = getSavedListingWithChat(listing.id);
      if (savedListing && savedListing.chatHistory.length > 0) {
        setMessages(savedListing.chatHistory);
      }
    }
  }, [user, listing.id]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Only scroll chat when new messages are added
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
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isTyping: true,
      };
      setMessages((prev) => [...prev, errorResponse]);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Common Header */}
      <ListingHeader 
        listing={listing} 
        onToggleLike={() => toggleLike(listing.id)}
        isLiked={!!listing.likedAt}
      />
      
      {/* Save Listing Button - Fixed position */}
      <div className="fixed bottom-8 right-8 z-50">
        <SaveListingButton 
          listing={listing} 
          chatHistory={messages}
          metadata={{ vinInfo: propVinInfo }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl -mt-8 relative z-10 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Main Content Area */}
          <div className="flex flex-col gap-6">
            {/* Tab Selector */}
            <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-border/50 p-2 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("main")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300",
                  activeTab === "main"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Car className="h-4 w-4" />
                Main Info
              </button>
              <button
                onClick={() => setActiveTab("damage")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300",
                  activeTab === "damage"
                    ? "bg-purple-600 text-white shadow-md"
                    : "hover:bg-purple-50 text-muted-foreground hover:text-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-300"
                )}
              >
                <Wrench className="h-4 w-4" />
                Damage Detection
              </button>
              <button
                onClick={() => setActiveTab("vin")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300",
                  activeTab === "vin"
                    ? "bg-green-600 text-white shadow-md"
                    : "hover:bg-green-50 text-muted-foreground hover:text-green-700 dark:hover:bg-green-950/30 dark:hover:text-green-300"
                )}
              >
                <FileCheck className="h-4 w-4" />
                VIN Checkup
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden min-h-[600px]">
              {activeTab === "main" && <MainInfoTab listing={listing} />}
              {activeTab === "damage" && <DamageDetectionTab listing={listing} />}
              {activeTab === "vin" && <VinCheckupTab listing={listing} vinInfo={propVinInfo} />}
            </div>
          </div>

          {/* Sidebar - AI Assistant (Persistent) */}
          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
            <div className="bg-white dark:bg-card border border-border/50 rounded-xl shadow-lg h-full flex flex-col overflow-hidden relative">
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
                    <div className="mb-4 p-3 bg-muted/50 rounded-full">
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
                        "max-w-[85%] px-4 py-3 rounded-2xl shadow-sm",
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
                          className="text-xs px-3 py-2 bg-muted hover:bg-muted/70 border border-border text-muted-foreground hover:text-foreground transition-colors text-left rounded-full"
                        >
                          {suggestion}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-muted/10">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about this car..."
                    className="flex-1 border-border bg-background rounded-full px-4"
                    disabled={isTyping}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0 rounded-full h-10 w-10"
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
