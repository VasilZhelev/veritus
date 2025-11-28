"use client";

import { useState, useEffect } from "react";
import { 
  Wrench, 
  XCircle, 
  Activity, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  Zap, 
  CircleDot, 
  MapPin, 
  Shield, 
  AlertCircle 
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

  return (
    <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border-r border-border/50 p-8 lg:p-12 relative overflow-hidden min-h-[500px]">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-transparent" />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-600" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-purple-500 text-white rounded-lg shadow-lg shadow-purple-500/20">
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
  );
}
