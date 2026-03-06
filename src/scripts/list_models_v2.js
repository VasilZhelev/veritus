require('dotenv').config({ path: '.env.local' });

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("No API Key found in .env.local");
    return;
  }
  
  console.log("Checking models for key ending in:", key.slice(-4));
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
        console.log("\nAvailable Models:");
        data.models.forEach(m => {
            console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
            console.log(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
        });
    } else {
        console.log("API Response:", JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

main();
