import { scrapeCarListing } from "../lib/scraper";

const url = "https://www.mobile.bg/obiava-21762431510491781-bmw-x5-m-pack-xdrive-360-kam-distronic-digital-pamet-lyuk";

async function main() {
  try {
    console.log("Starting scrape for:", url);
    const result = await scrapeCarListing(url);
    console.log("Scrape successful!");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Scrape failed:", error);
  }
}

main();
