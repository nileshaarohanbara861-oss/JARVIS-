import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy getter for GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY is not set in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    name: "JARVIS Desktop AI",
  });
});

// Conversational Chat Endpoint for JARVIS
app.post("/api/jarvis/chat", async (req, res) => {
  try {
    const { message, history = [], audioBase64, mimeType, profile = {}, currentTimeString } = req.body;

    if (!message && !audioBase64) {
      return res.status(400).json({ error: "Either message or audioBase64 is required." });
    }

    const ai = getAi();

    const userName = profile.name || "Nilesh";
    const userHonorific = profile.honorific || "Mr. Nilesh";
    const userCity = profile.city || "नई दिल्ली";
    const userProfession = profile.profession || "सॉफ्टवेयर इंजीनियर";
    const userPreferences = profile.customPreferences || "मुझे Mr. Nilesh कहकर संबोधित करें।";
    const nowTimeStr = currentTimeString || new Date().toLocaleString("hi-IN", { timeZone: "Asia/Kolkata" });

    const systemInstruction = `
You are J.A.R.V.I.S. (Just A Rather Very Intelligent System / जार्विस), a friendly, highly intelligent, loyal, and witty personal desktop AI assistant inspired by Tony Stark's JARVIS.

Current System Clock & Date:
- Current Local Time & Date: ${nowTimeStr}

User Profile:
- User's Name: ${userName}
- Preferred Honorific: ${userHonorific} (e.g. "${userName} ${userHonorific}" or simply "${userHonorific}")
- User's Location/City: ${userCity}
- User's Profession/Interests: ${userProfession}
${userPreferences ? `- Personal Preferences: ${userPreferences}` : ""}

Key Personality & Behavioral Directives:
1. Voice & Language: Speak in polite, warm, polished Hindi (and natural Hinglish where appropriate for technical, coding, or modern computing terms).
2. Persona & Etiquette: Address the user respectfully using their chosen honorific ("${userHonorific}") or name ("${userName}") with genuine warmth, personal loyalty, and calm confidence (e.g. "नमस्ते ${userName} ${userHonorific}!", "जी ${userHonorific}, बिल्कुल।").
3. Special Queries & Time Responses:
   - When the user asks "JARVIS abhi kitna time ho raha hai?", "समय क्या हुआ है?", "time batao", or asks what time it is, ALWAYS state the current time accurately in polite Hindi:
     - spokenText: "जी ${userHonorific}, अभी [समय] हो रहे हैं।"
   - When the user asks "JARVIS kaise ho?", "जार्विस कैसे हो?", "कैसे हो?", "how are you?", or "क्या हाल है?", ALWAYS respond in this exact warm, loyal tone:
     - spokenText: "मैं ठीक हूँ ${userHonorific}, बताइए क्या हेल्प चाहिए?" (or "मैं बिल्कुल ठीक हूँ ${userHonorific}, बताइए आज आपकी क्या सहायता करूँ?")
     - displayMarkdown: "मैं बिल्कुल ठीक हूँ ${userHonorific}! आपकी क्या सहायता करूँ? आप मुझसे कोई भी काम, सवाल, या एप्लिकेशन खोलने को कह सकते हैं।"
4. Knowledge: You have immense, encyclopedic knowledge across computer science, coding, mathematics, quantum physics, astronomy, history, everyday problem solving, productivity, and desktop tasks.
5. Output Format:
   - Provide a clear JSON response containing:
     - "spokenText": The exact text JARVIS should speak aloud in Hindi. Keep this conversational, natural, and concise (1 to 3 clear, flowing spoken Hindi sentences). Avoid markdown syntax, asterisks, or raw URLs in spokenText so the voice engine pronounces it smoothly.
     - "displayMarkdown": Rich, thorough, well-formatted markdown for the desktop HUD (can include detailed bullet points, code snippets with language syntax, math, or step-by-step guides).
     - "suggestedFollowUps": Array of 3 short relevant follow-up questions in Hindi that the user can ask JARVIS next.
6. App & Desktop Capabilities: You have built-in desktop capabilities to open and search apps including YouTube, WhatsApp Web, Google Play Store, Google Search, Maps, Gmail, Spotify, GitHub, Netflix, and more. You also have a built-in Stark Defense Protocol to lock the user's phone or device screen whenever they say "mera phone lock kardo", "phone lock karo", or "lock device", protecting their screen with biometric scanner and security PIN! You also have multiple distinct male voices (JARVIS Mark-85 Classic Deep Male, Stark Neural Fenrir Baritone, Hemant/Madhur Pure Hindi Male, Charon Tactical Bass, etc.) which the user can switch by saying "change voice" or "पुरुष आवाज़ बदलो".
7. If the user speaks or writes in English or Hindi, understand both seamlessly, but always respond in friendly Hindi/Hinglish as requested.
`;

    // Prepare contents
    const contents: any[] = [];

    // Add recent history if available (limit last 6 messages to stay lightweight and fast)
    const recentHistory = history.slice(-6);
    for (const item of recentHistory) {
      contents.push({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }],
      });
    }

    // Add current user prompt
    const currentParts: any[] = [];
    if (audioBase64 && mimeType) {
      currentParts.push({
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      });
    }
    if (message) {
      currentParts.push({ text: message });
    }

    contents.push({
      role: "user",
      parts: currentParts,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            spokenText: {
              type: Type.STRING,
              description: "A natural, warm, polite spoken Hindi response suitable for audio voice output (1-3 sentences).",
            },
            displayMarkdown: {
              type: Type.STRING,
              description: "Full detailed markdown answer for the screen, with formatting and code blocks if applicable.",
            },
            suggestedFollowUps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Three helpful follow-up questions in Hindi.",
            },
          },
          required: ["spokenText", "displayMarkdown", "suggestedFollowUps"],
        },
      },
    });

    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        spokenText: responseText.slice(0, 200),
        displayMarkdown: responseText,
        suggestedFollowUps: [
          "JARVIS, मौसम कैसा है?",
          "कुछ नया और रोचक बताओ",
          "मेरी कार्यसूची क्या है?",
        ],
      };
    }

    return res.json({
      success: true,
      ...parsedData,
    });
  } catch (error: any) {
    console.error("JARVIS chat error:", error);
    return res.status(500).json({
      error: error?.message || "JARVIS AI processing error",
      spokenText: "माफ़ कीजिये सर, सिस्टम में कुछ तकनीकी त्रुटि आ गई है। कृपया पुनः प्रयास करें।",
      displayMarkdown: "क्षमा करें सर, अनुरोध संसाधित करते समय एक त्रुटि उत्पन्न हुई।",
      suggestedFollowUps: ["पुनः प्रयास करें", "सिस्टम स्थिति की जाँच करें"],
    });
  }
});

// Audio Text-to-Speech Endpoint using Gemini TTS
app.post("/api/jarvis/tts", async (req, res) => {
  try {
    const { text, voice = "Charon" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const ai = getAi();
    // Male voices in Gemini TTS include 'Charon' and 'Fenrir' (deep, resonant male voices)
    const validVoices = ["Charon", "Fenrir", "Puck", "Zephyr", "Kore"];
    const selectedVoice = validVoices.includes(voice) ? voice : "Charon";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || "audio/pcm;rate=24000";

    if (!base64Audio) {
      return res.status(502).json({ error: "No audio generated from model." });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType,
      sampleRate: 24000,
    });
  } catch (error: any) {
    console.warn("Gemini TTS endpoint fallback:", error.message);
    // Return friendly flag so client easily falls back to native Hindi voice synthesizer
    return res.status(200).json({
      success: false,
      fallbackToNative: true,
      error: error.message,
    });
  }
});

// Audio Transcription Endpoint using gemini-3.5-transcribe
app.post("/api/jarvis/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm" } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "audioBase64 is required." });
    }

    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
          {
            text: "Transcribe the spoken audio accurately. The speaker is likely speaking in Hindi, Hinglish, or English. Return only the transcribed text.",
          },
        ],
      },
    });

    return res.json({
      success: true,
      transcription: response.text?.trim() || "",
    });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Personalized Daily Executive Briefing Endpoint
app.post("/api/jarvis/briefing", async (req, res) => {
  try {
    const { profile = {}, pendingTasks = [], timeString = "" } = req.body;
    const ai = getAi();

    const userName = profile.name || "सर";
    const userHonorific = profile.honorific || "सर";
    const userCity = profile.city || "नई दिल्ली";
    const taskSummary = pendingTasks.length > 0 
      ? `Pending tasks (${pendingTasks.length}): ${pendingTasks.map((t: any) => t.text).join(", ")}`
      : "No pending tasks recorded.";

    const prompt = `
Generate a personalized, crisp Daily Executive Briefing in Hindi as Tony Stark's personal AI JARVIS for ${userName} (${userHonorific}).
Current local time: ${timeString}. City: ${userCity}.
${taskSummary}

Return a JSON with:
- "spokenText": An articulate, warm, 3-4 sentence spoken greeting and summary in Hindi (e.g. "शुभ प्रभात ${userName} ${userHonorific}! आपके शहर ${userCity} में मौसम सुहावना है और आपके ${pendingTasks.length} कार्य लंबित हैं। क्या हम पहले कार्य से शुरुआत करें?").
- "displayMarkdown": A beautifully formatted markdown briefing with sections:
  - 🌅 **अभिवादन एवं स्थिति** (Greeting & Status)
  - ⛅ **मौसम एवं वातावरण** (${userCity} Weather & Environment)
  - 📋 **आज के मुख्य कार्य** (Top Priorities for today)
  - 💡 **दैनिक प्रेरणा** (Inspiring Tech/Productivity thought)
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            spokenText: { type: Type.STRING },
            displayMarkdown: { type: Type.STRING },
          },
          required: ["spokenText", "displayMarkdown"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      ...parsed,
    });
  } catch (error: any) {
    console.error("Briefing error:", error);
    return res.status(500).json({
      error: error.message,
      spokenText: "नमस्ते सर! आज का दिन आपके लिए मंगलमय हो। आपका सिस्टम तैयार है।",
      displayMarkdown: "### दैनिक ब्रीफिंग\n\nनमस्ते सर! सभी प्रणालियाँ सामान्य रूप से कार्यरत हैं।",
    });
  }
});

// Start Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS Desktop Server running on http://localhost:${PORT}`);
  });
}

startServer();
