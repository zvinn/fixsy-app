const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyA3KbQS7a3w5YjRRuUTvaLFjX7VBL8Y48w";

async function testGemini() {
    console.log("--- Verifying Gemini 1.5 Flash (New Key) ---");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("✅ Gemini Success:", response.text());
    } catch (error) {
        console.error("❌ Gemini Failed:", error.message);
    }
}

testGemini();
