
// Read key from environment - do not hardcode. Support Node (process.env) and Vite (import.meta.env).
const API_KEY = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || import.meta?.env?.VITE_GROQ_API_KEY || '';
if (!API_KEY) {
    console.error('No Groq API key found. Set VITE_GROQ_API_KEY in your environment.');
    process.exit(1);
}

async function testGroq() {
    console.warn("--- Testing Groq API (Llama 3) ---");

    const url = "https://api.groq.com/openai/v1/chat/completions";

    const payload = {
        model: "llama-3.3-70b-versatile", // Latest powerful model
        messages: [
            {
                role: "user",
                content: "Explain briefly: what is a wrench? Reply in JSON format: { \"definition\": \"...\" }"
            }
        ],
        response_format: { type: "json_object" } // Force JSON
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}\nBody: ${errorText}`);
        }

        const data = await response.json();
        console.warn("✅ Groq Verification Successful!");
        console.warn("Start Response >>>");
        console.warn(JSON.stringify(data, null, 2));
        console.warn("<<< End Response");

    } catch (error) {
        console.error("❌ Groq Test Failed:", error.message);
    }
}

testGroq();
