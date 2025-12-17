const { GoogleGenerativeAI } = require("@google/generative-ai");

// Key extracted from src/aiService.js
const API_KEY = "AIzaSyCxsDt_-_P8S8LAiriiYpXOu_ZGhkw6nC0";

async function test() {
    console.log("--- Verifying Gemini 1.5 Flash ---");

    if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        console.error("❌ API Key is missing!");
        return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    // Explicitly testing gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Explain briefly what is a wrench in 1 sentence.";

    try {
        console.log("⏳ Sending request...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("✅ API Success!");
        console.log("RESPONSE:", text);
    } catch (error) {
        console.error("❌ API Call Failed:", error.message);
    }
}

test();
