const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyA3KbQS7a3w5YjRRuUTvaLFjX7VBL8Y48w";

async function listModels() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Access the model manager directly if possible, or use a workaround
    // The SDK doesn't always expose listModels directly on the main instance easily.
    // Instead, let's try 'gemini-pro' as a fallback test first, or consult documentation logic.

    // Correction: The SDK *does* allow listing models via the API, but for simplicity let's test common variants.

    const modelsToTest = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    console.log("--- Testing Common Model Names ---");

    for (const m of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            console.log(`Testing: ${m}`);
            await model.generateContent("Hi");
            console.log(`✅ ${m} is AVAILABLE!`);
        } catch (e) {
            console.log(`❌ ${m} failed: ${e.message}`);
        }
    }
}

listModels();
