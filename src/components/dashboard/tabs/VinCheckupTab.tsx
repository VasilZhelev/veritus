"use client";

import { useState, useEffect } from "react";
import { 
  FileCheck, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  Car, 
  Calendar, 
  Fuel, 
  Globe,
  Palette,
  Tag,
  Banknote,
  ShieldAlert,
  FileText,
  Link as LinkIcon,
  Gauge
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CarListing } from "@/components/ui/car-listing-card";
import dynamic from "next/dynamic";

// Dynamic import for the map component (client-side only)
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

interface VinCheckupTabProps {
  listing: CarListing;
  vinInfo?: any;
}

export default function VinCheckupTab({ listing, vinInfo: propVinInfo }: VinCheckupTabProps) {
  const [vinInfo, setVinInfo] = useState<any>(propVinInfo || null);
  const [isLoadingVin, setIsLoadingVin] = useState(false);

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
    <div className="space-y-0 min-h-[500px]">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: "Make", value: vinInfo.details?.make, icon: Car },
                { label: "Model", value: vinInfo.details?.model, icon: Car },
                { label: "Year", value: vinInfo.details?.year, icon: Calendar },
                { label: "Fuel", value: vinInfo.details?.fuel, icon: Fuel },
                { label: "Color", value: vinInfo.details?.color, icon: Palette },
                { label: "Body Type", value: vinInfo.details?.bodyType, icon: Car },
                { label: "Version", value: vinInfo.details?.version, icon: Tag },
                { label: "Mileage", value: vinInfo.details?.mileage, icon: Gauge },
                { label: "Price", value: vinInfo.details?.price ? `${vinInfo.details.price} ${vinInfo.details.currency || ''}` : null, icon: Banknote },
              ]
                .filter(item => item.value && String(item.value).trim() !== "" && String(item.value).toLowerCase() !== "no information")
                .map(({ label, value, icon: Icon }) => (
                <div key={label} className="p-3 rounded-lg bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-border/50 shadow-sm transition-all hover:bg-white dark:hover:bg-background/80">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <div className="text-xs font-medium text-muted-foreground">{label}</div>
                  </div>
                  <div className="font-semibold text-sm truncate" title={String(value)}>{value}</div>
                </div>
              ))}
            </div>

            {/* External Links / Checks (If any exist) */}
            {([
              { label: "Vehicle History", url: vinInfo.details?.vehicleHistory, icon: FileText, color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800" },
              { label: "Stolen Check", url: vinInfo.details?.stolenCheck, icon: ShieldAlert, color: "text-red-500 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
              { label: "Full Report", url: vinInfo.details?.vinDecoder, icon: LinkIcon, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
            ]
              .filter(item => item.url && String(item.url).trim() !== "" && String(item.url).toLowerCase() !== "no information" && item.url.startsWith('http'))
              .length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: "Vehicle History", url: vinInfo.details?.vehicleHistory, icon: FileText, color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800" },
                  { label: "Stolen Check", url: vinInfo.details?.stolenCheck, icon: ShieldAlert, color: "text-red-500 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
                  { label: "Full Report", url: vinInfo.details?.vinDecoder, icon: LinkIcon, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
                ]
                  .filter(item => item.url && String(item.url).trim() !== "" && String(item.url).toLowerCase() !== "no information" && item.url.startsWith('http'))
                  .map(({ label, url, icon: Icon, color, bg, border }) => (
                  <a 
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:shadow-md active:scale-95",
                      bg, border, color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </a>
                ))}
              </div>
            )}

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

            {/* Origin Map - Beautiful Compact Display */}
            {vinInfo.details?.registrationCountry && String(vinInfo.details.registrationCountry).trim() !== "" && String(vinInfo.details.registrationCountry).toLowerCase() !== "no information" && (
              <div className="p-4 rounded-xl bg-white/80 dark:bg-background/80 backdrop-blur-md border border-border/50 shadow-sm mt-4 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block leading-none">Vehicle Origin</span>
                      <span className="text-xs text-muted-foreground">Registration or manufacturing base</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-sm font-bold bg-muted/50 dark:bg-muted/20 tracking-wider">
                    {vinInfo.details.registrationCountry}
                  </Badge>
                </div>
                <div className="h-48 sm:h-64 rounded-xl overflow-hidden border border-border/40 shadow-inner relative group">
                  <div className="absolute inset-0 z-10 pointer-events-none rounded-xl ring-1 ring-inset ring-black/5 dark:ring-white/5" />
                  <ImportMap countryCode={vinInfo.details.registrationCountry} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
