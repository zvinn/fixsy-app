
const API_KEY = "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";

async function testGroq() {
    console.log("--- Testing Groq API (Llama 3) ---");

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
        console.log("✅ Groq Verification Successful!");
        console.log("Start Response >>>");
        console.log(JSON.stringify(data, null, 2));
        console.log("<<< End Response");

    } catch (error) {
        console.error("❌ Groq Test Failed:", error.message);
    }
}

testGroq();
