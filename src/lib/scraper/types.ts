import type { CheerioAPI } from "cheerio";

export type Marketplace = "mobilebg";

export interface CarListing {
  source: Marketplace;
  url: string;
  title: string | null;
  price: number | null;
  currency: string | null;
  priceEuro?: number | null;
  priceLeva?: number | null;
  description: string | null;
  images: string[];
  attributes: Record<string, string>;
  location: string | null;
  postedAt: string | null;
  mileageKm: number | null;
  year: number | null;
}

export interface RawCarListing {
  source: Marketplace;
  url: string;
  title?: string;
  priceText?: string;
  currency?: string;
  priceEuroRaw?: string;
  priceLevaRaw?: string;
  description?: string;
  images?: string[];
  attributes?: Record<string, string>;
  location?: string;
  postedAt?: string;
  mileageText?: string;
  yearText?: string;
  rawDetails?: Record<string, unknown>;
}

export interface ScraperContext {
  url: string;
  html: string;
  $: CheerioAPI;
}

export interface ListingScraper {
  readonly source: Marketplace;
  matches(url: URL): boolean;
  scrape(context: ScraperContext): Promise<RawCarListing>;
}

export interface ScrapeOptions {
  signal?: AbortSignal;
}

export interface NormalizedScrapeResult {
  listing: CarListing;
  raw: RawCarListing;
}


