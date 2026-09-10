// ⚠️ SECURITY WARNING: Never hardcode API keys in source code!
// Always use environment variables for sensitive credentials.
// Try process.env first (Node scripts), then fall back to `import.meta.env` (Vite/Esm).
const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || import.meta?.env?.VITE_GROQ_API_KEY || '';

if (!GROQ_API_KEY) {
    console.error("❌ GROQ API key not found. Set VITE_GROQ_API_KEY (or GROQ_API_KEY) in your environment.");
    console.error("If this key was ever committed, rotate it immediately and add secret scanning to CI.");
    process.exit(1);
}

async function listGroqModels() {
    console.warn("--- Listing Groq Models ---");
    try {
        const response = await fetch("https://api.groq.com/openai/v1/models", {
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        console.warn("Available Models:");
        data.data.forEach(m => console.warn(`- ${m.id}`));

        // Check for vision
        const vision = data.data.find(m => m.id.includes("vision"));
        if (vision) {
            console.warn(`\n🎉 Found Vision Model: ${vision.id}`);
        } else {
            console.warn("\n❌ No 'vision' models found.");
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

listGroqModels();
