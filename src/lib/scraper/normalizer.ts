import { CarListing, RawCarListing } from "./types";
import { cleanText, parseInteger, parseNumber, uniqueStrings } from "./utils";

const CURRENCY_MAP: Record<string, string> = {
  лв: "BGN",
  bgn: "BGN",
  "€": "EUR",
  eur: "EUR",
  "$": "USD",
  usd: "USD",
};

function detectCurrency(input?: string | null): string | null {
  if (!input) {
    return null;
  }

  const normalized = input.toLowerCase();
  for (const [token, code] of Object.entries(CURRENCY_MAP)) {
    if (normalized.includes(token)) {
      return code;
    }
  }

  return null;
}

export function normalizeCarListing(raw: RawCarListing): CarListing {
  const title = cleanText(raw.title ?? "") || null;
  const description = cleanText(raw.description ?? "") || null;
  const price =
    parseNumber(raw.priceText) ??
    parseNumber(raw.priceEuroRaw) ??
    parseNumber(raw.priceLevaRaw) ??
    parseNumber(raw.rawDetails?.priceText?.toString()) ??
    null;
  const currency =
    raw.currency ??
    detectCurrency(raw.priceText) ??
    (raw.priceEuroRaw ? "EUR" : null) ??
    (raw.priceLevaRaw ? "BGN" : null) ??
    detectCurrency(raw.title);
  const priceEuro = parseNumber(raw.priceEuroRaw) ?? null;
  const priceLeva = parseNumber(raw.priceLevaRaw) ?? null;
  const mileageKm = parseInteger(raw.mileageText);
  const year = parseInteger(raw.yearText);
  const vin = raw.vin ? cleanText(raw.vin) : null;

  return {
    source: raw.source,
    url: raw.url,
    title,
    description,
    price,
    currency,
    priceEuro,
    priceLeva,
    mileageKm,
    year,
    vin,
    location: cleanText(raw.location ?? "") || null,
    postedAt: cleanText(raw.postedAt ?? "") || null,
    images: uniqueStrings(raw.images ?? []),
    attributes: raw.attributes ?? {},
  };
}

