const https = require('https');
const fs = require('fs');
const path = require('path');

// Try to find .env file
function getApiKey() {
    try {
        const content = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf8');
        const match = content.match(/GEMINI_API_KEY=(.*)/);
        if (match) return match[1].trim();
    } catch (e) {}
    
    try {
        const content = fs.readFileSync(path.join(__dirname, '../../.env'), 'utf8');
        const match = content.match(/GEMINI_API_KEY=(.*)/);
        if (match) return match[1].trim();
    } catch (e) {}
    
    return process.env.GEMINI_API_KEY;
}

const API_KEY = getApiKey();

if (!API_KEY) {
    console.error("Could not find GEMINI_API_KEY in .env or .env.local");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
                console.error("API Error:", JSON.stringify(parsed.error, null, 2));
            } else {
                console.log("Available Models:");
                parsed.models.forEach(m => {
                    if (m.supportedGenerationMethods.includes('generateContent')) {
                        console.log(`- ${m.name} (Supports: generateContent)`);
                    } else {
                         console.log(`- ${m.name}`);
                    }
                });
            }
        } catch (e) {
            console.error("Failed to parse response:", data);
        }
    });
}).on('error', (err) => {
    console.error("Request failed:", err.message);
});
