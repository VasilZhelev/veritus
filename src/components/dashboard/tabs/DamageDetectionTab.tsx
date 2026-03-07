"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  MapPin, 
  Shield, 
  AlertCircle,
  Camera,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CarListing } from "@/components/ui/car-listing-card";

interface DamageDetectionTabProps {
  listing: CarListing;
}

export default function DamageDetectionTab({ listing }: DamageDetectionTabProps) {
  const [damageAnalysis, setDamageAnalysis] = useState<any>(null);
  const [isDamageLoading, setIsDamageLoading] = useState(false);
  const [damageError, setDamageError] = useState<string | null>(null);

  const listingImages = listing.images && Array.isArray(listing.images) 
    ? listing.images 
    : listing.image 
      ? [listing.image] 
      : [];

  const [retryCount, setRetryCount] = useState(0);

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
          
          const data = await response.json();

          if (response.ok) {
            setDamageAnalysis(data);
          } else {
            if (response.status === 429) {
              setDamageError(data.error || 'AI service is busy. Please try again in a moment.');
            } else {
              setDamageError(data.error || 'Failed to analyze images');
            }
          }
        } catch (error) {
          console.error('Failed to fetch damage analysis:', error);
          setDamageError('Error analyzing images. Please check your connection.');
        } finally {
          setIsDamageLoading(false);
        }
      }
    };

    fetchDamageAnalysis();
  }, [listingImages.length, retryCount]); // Add retryCount dependency

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const hasDamages = damageAnalysis && damageAnalysis.damages && damageAnalysis.damages.length > 0;

  return (
    <div className="bg-white dark:bg-card border-r border-border/50 p-8 lg:p-12 relative min-h-[500px]">
      {/* Vertical accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-700" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">AI Condition Assessment</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Camera className="h-4 w-4" /> Analyzed {Math.min(2, listingImages.length)} interior/exterior image{listingImages.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {isDamageLoading && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mb-4" />
          <h3 className="font-medium">Scanning for issues</h3>
          <p className="text-sm text-muted-foreground mt-1">Our AI is reviewing high-resolution details...</p>
        </div>
      )}

      {damageError && !isDamageLoading && (
        <div className="p-8 rounded-2xl border border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center text-center">
          <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4 ring-8 ring-destructive/5">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-destructive mb-1">Analysis Unavailable</h3>
          <p className="text-sm text-destructive/80 max-w-md mb-6">{damageError}</p>
          <button 
            onClick={handleRetry}
            className="px-5 py-2.5 bg-background border border-border shadow-sm hover:shadow hover:bg-muted text-sm font-medium rounded-lg transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {damageAnalysis && !isDamageLoading && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {!hasDamages ? (
            /* Pristine State / No Damages */
            <div className="p-8 lg:p-12 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/20" />
              <div className="h-24 w-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 ring-8 ring-purple-500/5">
                <CheckCircle2 className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold text-purple-900 dark:text-purple-100 mb-3">Pristine Condition</h3>
              <p className="text-purple-700/80 dark:text-purple-300/80 max-w-lg text-sm leading-relaxed">
                Our AI scanning detected no visible damages, scratches, or defects in the provided images. 
                The exterior and interior appear to be in excellent condition.
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="p-4 rounded-xl bg-background/60 border border-purple-500/10 flex flex-col items-center">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Overall</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">{damageAnalysis.overallCondition || "Excellent"}</span>
                </div>
                <div className="p-4 rounded-xl bg-background/60 border border-purple-500/10 flex flex-col items-center">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Severity</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">None</span>
                </div>
              </div>
            </div>
          ) : (
            /* Damages Found State */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Detected Issues
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Found {damageAnalysis.damages.length} area{damageAnalysis.damages.length !== 1 ? 's' : ''} requiring attention
                  </p>
                </div>
                
                <div className="inline-flex self-start sm:self-auto rounded-lg bg-muted text-sm border flex-shrink-0">
                  <div className="px-3 py-1.5 border-r border-border text-muted-foreground">Condition</div>
                  <div className="px-3 py-1.5 font-medium">{damageAnalysis.overallCondition || "Fair"}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {damageAnalysis.damages.map((damage: any, index: number) => {
                  const severityStyles: Record<string, string> = {
                    minor: "border-blue-200 bg-blue-50/40 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-100",
                    moderate: "border-amber-200 bg-amber-50/40 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100",
                    severe: "border-red-200 bg-red-50/40 text-red-900 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-100"
                  };
                  
                  const activeSeverityClass = severityStyles[damage.severity?.toLowerCase()] || "border-border bg-muted/20 text-foreground";

                  const badgeStyles: Record<string, string> = {
                    minor: "bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
                    moderate: "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800",
                    severe: "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800"
                  };

                  const activeBadgeClass = badgeStyles[damage.severity?.toLowerCase()] || "bg-muted text-muted-foreground border-border";

                  return (
                    <div 
                      key={index}
                      className={cn(
                        "p-5 rounded-xl border flex flex-col gap-3 transition-colors hover:shadow-sm",
                        activeSeverityClass
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-base">{damage.type}</h4>
                            <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0 h-5 border flex-shrink-0 ml-3", activeBadgeClass)}>
                              {damage.severity}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center text-[13px] opacity-80 mb-3 font-medium">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {damage.location}
                          </div>
                          
                          <p className="text-sm opacity-90 leading-relaxed">
                            {damage.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Context & Summary section */}
          {(damageAnalysis.summary || (damageAnalysis.recommendations && damageAnalysis.recommendations.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/40">
              
              {damageAnalysis.summary && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-semibold text-[13px] text-muted-foreground tracking-wider uppercase">
                    <Search className="h-4 w-4" /> Assessment Summary
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {damageAnalysis.summary}
                  </p>
                </div>
              )}

              {damageAnalysis.recommendations && damageAnalysis.recommendations.length > 0 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-semibold text-[13px] text-muted-foreground tracking-wider uppercase">
                    <Shield className="h-4 w-4" /> Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {damageAnalysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground/40 flex-shrink-0" />
                        <span className="leading-relaxed text-foreground/90">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer text */}
          <div className="flex items-start gap-3 text-xs text-muted-foreground/80 bg-muted/30 border border-border/50 p-4 rounded-xl mt-6">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Disclaimer:</strong> This is an AI-assisted visual assessment based on available listing imagery. It is not a substitute for a professional physical inspection. Unseen mechanical or structural issues may exist outside of the provided photographs.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
