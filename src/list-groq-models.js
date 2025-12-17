
const GROQ_API_KEY = "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";

async function listGroqModels() {
    console.log("--- Listing Groq Models ---");
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
        console.log("Available Models:");
        data.data.forEach(m => console.log(`- ${m.id}`));

        // Check for vision
        const vision = data.data.find(m => m.id.includes("vision"));
        if (vision) {
            console.log(`\n🎉 Found Vision Model: ${vision.id}`);
        } else {
            console.log("\n❌ No 'vision' models found.");
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

listGroqModels();
