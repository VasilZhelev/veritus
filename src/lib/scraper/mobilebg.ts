import type { CheerioAPI } from "cheerio";
import { cleanText, uniqueStrings } from "./utils";
import type { ListingScraper, RawCarListing, ScraperContext } from "./types";

const MOBILE_BG_HOSTNAMES = new Set(["mobile.bg", "www.mobile.bg"]);

function resolveAbsoluteUrl(candidate: string, origin: string): string {
  if (!candidate) {
    return candidate;
  }
  if (candidate.startsWith("//")) {
    return `https:${candidate}`;
  }
  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    return candidate;
  }
  try {
    return new URL(candidate, origin).toString();
  } catch {
    return candidate;
  }
}

function grabTitle($: CheerioAPI): string | undefined {
  let titleNode = $("div.obTitle h1").first();
  
  // Fallback: try div.obTitle directly if h1 is missing
  if (titleNode.length === 0) {
    titleNode = $("div.obTitle").first();
  }

  if (titleNode.length === 0) {
    return undefined;
  }

  const explicitText = titleNode
    .contents()
    .filter((_, node) => node.type === "text")
    .first()
    .text();

  const title = cleanText(explicitText || titleNode.text());
  return title.length ? title : undefined;
}

function extractYearFromNode(node: ReturnType<CheerioAPI>): string | undefined {
  const yearText = cleanText(node.text());
  const match = yearText.match(/\b(19|20)\d{2}\b/);
  return match?.[0];
}

function grabYear($: CheerioAPI): string | undefined {
  const legacyYearNode = $("div[class*='proizvodstvo'] .mpInfo").first();
  const legacyYear = legacyYearNode.length ? extractYearFromNode(legacyYearNode) : undefined;
  if (legacyYear) {
    return legacyYear;
  }

  const techDataItems = $(".techData .items .item");
  for (let i = 0; i < techDataItems.length; i += 1) {
    const item = techDataItems.eq(i);
    const valueNode = item.children().eq(1);
    const yearMatch = extractYearFromNode(valueNode);
    if (yearMatch) {
      return yearMatch;
    }
  }

  return undefined;
}

interface PriceSegment {
  text: string;
  amountRaw: string;
  currencyToken: string | null;
}

function parsePriceSegment(segmentHtml: string | null | undefined): PriceSegment | null {
  if (!segmentHtml) {
    return null;
  }

  const text = cleanText(
    segmentHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?[^>]+>/g, " "),
  );

  if (!text) {
    return null;
  }

  const amountMatch = text.match(/(\d[\d\s.,]*)/);
  if (!amountMatch) {
    return null;
  }

  return {
    text,
    amountRaw: amountMatch[1].replace(/\s+/g, ""),
    currencyToken: text.match(/(€|лв\.?|bgn|eur|usd)/i)?.[1] ?? null,
  };
}

function grabPriceFields(
  $: CheerioAPI,
): Pick<RawCarListing, "priceEuroRaw" | "priceLevaRaw"> {
  const priceNode = $("div.Price").first();
  if (!priceNode.length) {
    return {};
  }

  const html = priceNode.html() ?? "";
  const segments = html.split(/<br\s*\/?>/i);
  const euroSegment = parsePriceSegment(segments[0]);
  const levaSegment = parsePriceSegment(segments[1]);

  return {
    priceEuroRaw: euroSegment?.amountRaw,
    priceLevaRaw: levaSegment?.amountRaw,
  };
}

function grabImages($: CheerioAPI, origin: string): string[] {
  const nodes = $("#owlcarousel img.carouselimg");
  if (!nodes.length) {
    return [];
  }

  const urls = nodes
    .map((_, el) => {
      const node = $(el);
      const src =
        node.attr("data-src") ??
        node.attr("data-lazy") ??
        node.attr("src") ??
        "";
      const cleaned = cleanText(src);
      return cleaned ? resolveAbsoluteUrl(cleaned, origin) : null;
    })
    .get()
    .filter((value): value is string => !!value);

  return uniqueStrings(urls);
}

function grabDescription($: CheerioAPI): string | undefined {
  const modernNode = $(".moreInfo .text").first();
  if (modernNode.length) {
    const html = modernNode.html();
    if (html) {
      const normalized = cleanText(
        html
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n")
          .replace(/<\/?[^>]+>/g, " "),
      );
      if (normalized.length) {
        return normalized;
      }
    }

    const fallbackText = cleanText(modernNode.text());
    if (fallbackText.length) {
      return fallbackText;
    }
  }

  const legacyNode = $("div.dinfo").first();
  const legacyText = cleanText(legacyNode.text());
  return legacyText.length ? legacyText : undefined;
}

function grabLocation($: CheerioAPI): string | undefined {
  const node = $(".carLocation span").first();
  let text = cleanText(node.text());
  if (!text) {
    return undefined;
  }

  text = text.replace(/^Намира се в\s*/i, "");
  text = text.replace(/^гр\.\s*/i, "");
  text = text.replace(/^обл\.\s*/i, "");
  text = text.replace(/,\s*обл\..*/i, "");
  text = text.replace(/,\s*област.*/i, "");
  text = cleanText(text);
  return text.length ? text : undefined;
}

function grabAttributes($: CheerioAPI): Record<string, string> {
  const attributes: Record<string, string> = {};

  // Extract from ul.parameters > li
  $("ul.parameters > li").each((_, li) => {
    const key = cleanText($(li).find("span.label").text());
    const value = cleanText($(li).find("span.value").text());
    if (key && value) {
      attributes[key] = value;
    }
  });

  // Extract from .techData .items .item (technical data section)
  $(".techData .items .item").each((_, item) => {
    const children = $(item).children();
    if (children.length >= 2) {
      const key = cleanText(children.eq(0).text());
      const value = cleanText(children.eq(1).text());
      if (key && value) {
        attributes[key] = value;
      }
    }
  });

  // Extract features from div.details ul li
  const features: string[] = [];
  $("div.details ul li").each((_, li) => {
    const feature = cleanText($(li).text());
    if (feature) {
      features.push(feature);
    }
  });

  if (features.length) {
    attributes["Особености"] = features.join(", ");
  }

  return attributes;
}

function grabPostedAt($: CheerioAPI): string | undefined {
  const statsNode = $(".statistiki .text").first();
  const text = cleanText(statsNode.text());
  if (!text) {
    return undefined;
  }

  const timeMatch = text.match(
    /Публикувана\s+(?:в\s+)?([\d:.]+)\s+часа?\s+на\s+(\d{2}\.\d{2}\.\d{4})/i,
  );
  if (timeMatch) {
    const [, time, date] = timeMatch;
    return `${date} ${time}`;
  }

  const dateMatch = text.match(/Публикувана\s+на\s+(\d{2}\.\d{2}\.\d{4})/i);
  if (dateMatch) {
    return dateMatch[1];
  }

  return undefined;
}

function grabMileageText($: CheerioAPI): string | undefined {
  const mainValue = cleanText(
    $(".mainCarParams .item.probeg .mpInfo").first().text(),
  );
  if (mainValue.length) {
    return mainValue;
  }

  const techItem = $(".techData .items .item").filter((_, el) => {
    const label = cleanText($(el).children().first().text());
    return /Пробег/i.test(label);
  });
  const techValue = cleanText(techItem.first().children().eq(1).text());
  return techValue.length ? techValue : undefined;
}

async function parseMobileBgListing(
  context: ScraperContext,
): Promise<RawCarListing> {
  const { $, url } = context;

  const title = grabTitle($);
  const yearText = grabYear($);
  const description = grabDescription($);
  const images = grabImages($, url);
  const attributes = grabAttributes($);
  const location = grabLocation($) ?? attributes["Местоположение"];
  const priceFields = grabPriceFields($);
  const postedAt = grabPostedAt($);
  const mileageText = grabMileageText($) ?? attributes["Пробег"];

  return {
    source: "mobilebg",
    url,
    title,
    description,
    images,
    attributes,
    location,
    postedAt,
    mileageText,
    yearText: yearText ?? attributes["Дата на производство"],
    rawDetails: {},
    ...priceFields,
  };
}

export const mobileBgScraper: ListingScraper = {
  source: "mobilebg",
  matches(url) {
    return MOBILE_BG_HOSTNAMES.has(url.hostname);
  },
  async scrape(context) {
    return parseMobileBgListing(context);
  },
};