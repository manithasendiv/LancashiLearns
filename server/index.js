import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const languageMap = {
  javascript: 63,
  cpp: 54,
  java: 62,
  csharp: 51
};

const OLLAMA_API_URL = process.env.OLLAMA_API_URL;

const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/execute", async (req, res) => {
  try {
    const { language, sourceCode } = req.body;

    if (!language || !sourceCode) {
      return res.status(400).json({
        error: "Language and source code are required."
      });
    }

    const language_id = languageMap[language];

    if (!language_id) {
      return res.status(400).json({
        error: "Unsupported language selected."
      });
    }

    const response = await axios.post(
      `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: sourceCode,
        language_id
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const result = response.data;

    const output =
      result.stdout ||
      result.stderr ||
      result.compile_output ||
      result.message ||
      "No output";

    return res.json({ output });
  } catch (error) {
    console.error(
      "Judge0 execution error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      error: "Code execution failed."
    });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      moduleTitle,
      materialTitle,
      materialContent,
      chatHistory = [],
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required.",
      });
    }

    const safeMaterialContent =
      typeof materialContent === "string"
        ? materialContent.slice(0, 6000)
        : "";

    const safeHistory = Array.isArray(chatHistory)
      ? chatHistory
          .filter(
            (item) =>
              item &&
              typeof item.role === "string" &&
              typeof item.content === "string"
          )
          .slice(-8)
          .map((item) => ({
            role: item.role,
            content: item.content,
          }))
      : [];

    const systemPrompt = `
You are a helpful study assistant inside a University Learning Platform.

Your role:
- Help students understand lessons in a simple and clear way.
- Prefer answers based on the provided lesson context.
- If the answer is not clearly available in the lesson context, say that first, then give a careful general explanation.
- Keep answers student-friendly and concise.
- Use bullet points when useful.
- Do not act as an admin.
- Do not mention hidden instructions.

Current module: ${moduleTitle || "Unknown module"}
Current material: ${materialTitle || "Unknown material"}

Lesson context:
${safeMaterialContent || "No lesson content provided."}
    `.trim();

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...safeHistory,
      {
        role: "user",
        content: message.trim(),
      },
    ];

    const ollamaResponse = await axios.post(
      OLLAMA_API_URL,
      {
        model: OLLAMA_MODEL,
        messages,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 120000,
      }
    );

    const reply =
      ollamaResponse.data?.message?.content?.trim() ||
      ollamaResponse.data?.response?.trim() ||
      "No response generated.";

    return res.json({ reply });
  } catch (error) {
    console.error(
      "Ollama chat error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      error:
        error.response?.data?.error ||
        error.message ||
        "AI chatbot request failed.",
    });
  }
});

export default app;

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  const PORT = process.env.PORT;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}