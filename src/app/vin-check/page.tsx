"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, CheckCircle, AlertTriangle, Info } from "lucide-react";
import vinData from "@/lib/demo/vin-checker-output.json";
import dynamic from "next/dynamic";

const ImportMap = dynamic(() => import("@/components/ui/import-map"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center text-muted-foreground">Loading Map...</div>
});

export default function VinCheckPage() {
  const [vin, setVin] = useState("");
  const [result, setResult] = useState<typeof vinData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (vin.length < 17) {
        setError("Please enter a valid 17-character VIN.");
        return;
      }
      // For demo purposes, we return the mock data regardless of input, 
      // but in a real app we'd check the specific VIN.
      setResult(vinData);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">VIN Mileage Check</h1>
        <p className="text-muted-foreground">
          Verify the mileage history of any vehicle before you buy.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter Vehicle Identification Number (VIN)</CardTitle>
          <CardDescription>
            Find the VIN on the dashboard, driver's door jamb, or registration documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="vin" className="sr-only">VIN</Label>
              <Input
                id="vin"
                placeholder="e.g. WVWZZZ1KZEW123456"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                className="uppercase font-mono"
                maxLength={17}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Checking...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Check History
                </span>
              )}
            </Button>
          </form>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-green-700 dark:text-green-300">
                    Vehicle Found: {result.details.make} {result.details.model} ({result.details.year})
                  </h3>
                  <p className="text-muted-foreground">
                    VIN: <span className="font-mono font-medium text-foreground">{result.vin}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Last Recorded Mileage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">
                  {result.details.lastRecordedMileageKm.toLocaleString()} km
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  Recorded on {new Date(result.details.lastRecordedDate).toLocaleDateString()}
                </div>
                <div className="mt-4 text-sm bg-muted p-3 rounded-md">
                  Source: <span className="font-medium">{result.details.mileageSource}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Fuel Type</span>
                  <span className="font-medium">{result.details.fuel}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Registration Country</span>
                  <span className="font-medium">{result.details.registrationCountry}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Import Status</span>
                  <span className="font-medium flex items-center gap-1">
                    {result.details.imported ? (
                      <>
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        Imported
                      </>
                    ) : "Domestic"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {result.details.registrationCountry && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Origin</CardTitle>
                <CardDescription>
                  Imported from {result.details.registrationCountry}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImportMap countryCode={result.details.registrationCountry} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
