import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const languageMap = {
  javascript: 63,
  cpp: 54,
  java: 62,
  csharp: 51
};

app.get("/", (req, res) => {
  res.send("API is running");
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
    console.error("Judge0 execution error:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Code execution failed."
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});