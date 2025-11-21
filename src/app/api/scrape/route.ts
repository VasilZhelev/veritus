import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/admin";
import {
  scrapeCarListing,
  ScraperExecutionError,
  UnsupportedMarketplaceError,
} from "@/lib/scraper";

interface ScrapeRequestBody {
  url?: string;
}

function extractBearerToken(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token;
}

export async function POST(req: Request) {
  const token = extractBearerToken(req.headers.get("authorization"));

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, statusText: "Unauthorized" },
    );
  }

  try {
    await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error("Scrape route auth error:", error);
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401, statusText: "Unauthorized" },
    );
  }

  let body: ScrapeRequestBody;

  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, statusText: "Bad Request" },
    );
  }

  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json(
      { error: "Missing url in request body" },
      { status: 400, statusText: "Bad Request" },
    );
  }

  let validatedUrl: string;

  try {
    const parsed = new URL(body.url);
    validatedUrl = parsed.toString();
  } catch {
    return NextResponse.json(
      { error: "Invalid url format" },
      { status: 400, statusText: "Bad Request" },
    );
  }

  try {
    const result = await scrapeCarListing(validatedUrl, { signal: req.signal });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UnsupportedMarketplaceError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, statusText: "Bad Request" },
      );
    }

    if (error instanceof ScraperExecutionError) {
      console.error("Scraper execution error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 502, statusText: "Bad Gateway" },
      );
    }

    console.error("Scrape route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, statusText: "Internal Server Error" },
    );
  }
}






