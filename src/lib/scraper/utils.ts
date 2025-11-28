import { Buffer } from "node:buffer";
import { load, Cheerio, CheerioAPI } from "cheerio";
import type { ScrapeOptions } from "./types";

const DEFAULT_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,bg;q=0.8",
};

export interface FetchHtmlResult {
  html: string;
  $: CheerioAPI;
}

function detectEncodingFromHeaders(headers: Headers): string | null {
  const contentType = headers.get("content-type");
  if (!contentType) {
    return null;
  }

  const match = contentType.match(/charset=([^;]+)/i);
  return match ? match[1].trim().toLowerCase() : null;
}

function detectEncodingFromContent(buffer: ArrayBuffer): string | null {
  if (typeof Buffer === "undefined") {
    return null;
  }

  const asciiSample = Buffer.from(buffer).toString("latin1", 0, 2048);
  const metaCharset = asciiSample.match(
    /<meta[^>]+charset=["']?([\w-]+)/i,
  );
  if (metaCharset?.[1]) {
    return metaCharset[1].toLowerCase();
  }

  const metaContent = asciiSample.match(
    /<meta[^>]+content=["'][^"']*charset=([\w-]+)/i,
  );
  if (metaContent?.[1]) {
    return metaContent[1].toLowerCase();
  }

  return null;
}

function decodeBuffer(buffer: ArrayBuffer, encoding: string): string {
  try {
    const decoder = new TextDecoder(encoding, { fatal: false });
    return decoder.decode(buffer);
  } catch {
    const fallback = new TextDecoder("utf-8", { fatal: false });
    return fallback.decode(buffer);
  }
}

export async function fetchHtml(
  url: string,
  options: ScrapeOptions = {},
): Promise<FetchHtmlResult> {
  const response = await fetch(url, {
    headers: DEFAULT_HEADERS,
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL ${url}: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const headerEncoding = detectEncodingFromHeaders(response.headers);
  const contentEncoding = detectEncodingFromContent(buffer);
  const encoding = (contentEncoding ?? headerEncoding ?? "utf-8").toLowerCase();

  const html = decodeBuffer(buffer, encoding);
  const $ = load(html);

  return { html, $ };
}

export interface SelectorHelpers {
  text: (key: string, context?: Cheerio<any>) => string | null;
  texts: (key: string, context?: Cheerio<any>) => string[];
  attr: (
    key: string,
    attrName: string,
    context?: Cheerio<any>,
  ) => string | null;
  nodes: (key: string, context?: Cheerio<any>) => Cheerio<any>;
}

export type SelectorMap = Record<string, string | string[]>;

export function createSelectorHelpers(
  $: CheerioAPI,
  selectors: SelectorMap,
): SelectorHelpers {
  const resolve = (key: string): string[] => {
    const selector = selectors[key];
    if (!selector) {
      return [];
    }
    return Array.isArray(selector) ? selector : [selector];
  };

  const nodesFor = (key: string, context?: Cheerio<any>) => {
    const selectors = resolve(key);
    const base = context ?? $.root();
    const elements = selectors.flatMap((selector) =>
      base.find(selector).toArray(),
    );
    return $(elements);
  };

  return {
    nodes: nodesFor,
    text: (key, context) => {
      const nodes = nodesFor(key, context);
      if (nodes.length === 0) {
        return null;
      }
      const candidate =
        cleanText(nodes.first().text()) ||
        cleanText(
          nodes.first().attr("content") ??
            nodes.first().attr("value") ??
            nodes.first().attr("data-value") ??
            "",
        );
      return candidate.length > 0 ? candidate : null;
    },
    texts: (key, context) =>
      nodesFor(key, context)
        .map((_, el) => {
          const node = $(el);
          const text = cleanText(node.text());
          if (text.length > 0) {
            return text;
          }
          return (
            cleanText(
              node.attr("content") ??
                node.attr("value") ??
                node.attr("data-value") ??
                "",
            ) || ""
          );
        })
        .get()
        .filter((value) => value.length > 0),
    attr: (key, attrName, context) => {
      const nodes = nodesFor(key, context);
      const value = nodes
        .map((_, el) => cleanText($(el).attr(attrName) ?? ""))
        .get()
        .find((text) => text.length > 0);
      return value ?? null;
    },
  };
}

export function cleanText(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  return value.replace(/\s+/g, " ").trim();
}

export function parseNumber(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .replace(/[^\d.,-]/g, "")
    .replace(",", ".")
    .trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseInteger(
  value: string | null | undefined,
): number | null {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[^\d-]/g, "");
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function uniqueStrings(values: (string | null | undefined)[]): string[] {
  return Array.from(
    new Set(values.filter((value): value is string => !!value && value.length > 0)),
  );
}

