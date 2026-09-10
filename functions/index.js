require('dotenv').config();
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Groq } = require('groq-sdk');
const axios = require('axios');

admin.initializeApp();

// Initialize Groq Client
// Production: Use functions.config().groq.key
// Local: Use process.env.GROQ_API_KEY
const getGroqClient = () => {
    const apiKey = functions.config().groq?.key || process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("GROQ_API_KEY is missing!");
        return null;
    }
    return new Groq({ apiKey });
};

const GEMINI_API_KEY = functions.config().gemini?.key || process.env.REACT_APP_GEMINI_API_KEY;

/**
 * Rate Limiter Helper (Firestore-based)
 * Limits: 5 requests per minute per user
 */
const checkRateLimit = async (userId) => {
    const now = Date.now();
    const windowStart = now - (60 * 1000); // 1 minute

    const rateLimitRef = admin.firestore().collection('rate_limits').doc(userId);
    const doc = await rateLimitRef.get();

    let data = doc.exists ? doc.data() : { requests: [] };

    // Cleanup: Filter out old timestamps
    data.requests = (data.requests || []).filter(timestamp => timestamp > windowStart);

    if (data.requests.length >= 5) {
        return false;
    }

    data.requests.push(now);
    await rateLimitRef.set(data);
    return true;
};

/**
 * Chat with Fixsy AI (Secure Proxy)
 */
exports.chatWithFixsy = functions.https.onCall(async (data, context) => {
    // 1. Security: Ensure user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in to chat with Fixsy.'
        );
    }

    const userId = context.auth.uid;

    // 2. Rate Limiting
    const isAllowed = await checkRateLimit(userId);
    if (!isAllowed) {
        throw new functions.https.HttpsError(
            'resource-exhausted',
            'Rate limit exceeded. Please wait a minute.'
        );
    }

    const { messages, userProfile } = data;
    const groq = getGroqClient();

    if (!groq) {
        throw new functions.https.HttpsError('internal', 'AI Service Unavailable');
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are Fixsy AI, a professional home maintenance assistant. 
                    Client Context: ${JSON.stringify(userProfile || {})}`
                },
                ...messages
            ],
            model: "llama-3.2-90b-vision-preview",
            temperature: 0.7,
            max_tokens: 1024,
        });

        return {
            success: true,
            response: completion.choices[0]?.message?.content || "No response generated."
        };
    } catch (error) {
        console.error("Groq API Error:", error);
        throw new functions.https.HttpsError('internal', 'Failed to generate response.');
    }
});

/**
 * Analyze Problem Image (Secure Proxy)
 */
exports.analyzeProblem = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authenticated access required.');
    }

    const userId = context.auth.uid;

    // Rate Limiting
    const isAllowed = await checkRateLimit(userId);
    if (!isAllowed) {
        throw new functions.https.HttpsError(
            'resource-exhausted',
            'Rate limit exceeded.'
        );
    }

    const { imageBase64, description } = data;

    // Logic to call Gemini 1.5 Flash via Axios
    try {
        if (!GEMINI_API_KEY) throw new Error("Gemini API key missing");

        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            contents: [{
                parts: [
                    { text: description || "Analyze this home maintenance problem." },
                    { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                ]
            }],
            generationConfig: {
                response_mime_type: "application/json",
            }
        });

        const result = response.data.candidates[0].content.parts[0].text;
        return {
            success: true,
            analysis: JSON.parse(result)
        };
    } catch (error) {
        console.error("Gemini Backend Error:", error);
        return {
            success: false,
            error: "Image analysis failed."
        };
    }
});
