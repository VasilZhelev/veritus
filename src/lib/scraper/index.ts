import { mobileBgScraper } from "./mobilebg";
import { normalizeCarListing } from "./normalizer";
import { fetchHtml } from "./utils";
import type {
  ListingScraper,
  NormalizedScrapeResult,
  RawCarListing,
  ScrapeOptions,
} from "./types";

const SCRAPERS: ListingScraper[] = [mobileBgScraper];

export class UnsupportedMarketplaceError extends Error {
  constructor(public readonly url: string) {
    super(`No scraper available for URL: ${url}`);
    this.name = "UnsupportedMarketplaceError";
  }
}

export class ScraperExecutionError extends Error {
  constructor(
    public readonly url: string,
    public readonly source: string,
    cause: unknown,
  ) {
    super(
      `Failed to scrape listing from ${source} at ${url}${
        cause instanceof Error ? `: ${cause.message}` : ""
      }`,
    );
    this.name = "ScraperExecutionError";
    this.cause = cause;
  }
}

export function resolveScraper(url: URL): ListingScraper | null {
  return SCRAPERS.find((scraper) => scraper.matches(url)) ?? null;
}

export async function scrapeCarListing(
  url: string,
  options?: ScrapeOptions,
): Promise<NormalizedScrapeResult> {
  const target = new URL(url);
  const scraper = resolveScraper(target);

  if (!scraper) {
    throw new UnsupportedMarketplaceError(url);
  }

  try {
    const { html, $ } = await fetchHtml(target.toString(), options);
    const raw: RawCarListing = await scraper.scrape({
      url: target.toString(),
      html,
      $,
    });
    const listing = normalizeCarListing(raw);

    return { listing, raw };
  } catch (error) {
    throw new ScraperExecutionError(target.toString(), scraper.source, error);
  }
}

export type { NormalizedScrapeResult, RawCarListing } from "./types";

