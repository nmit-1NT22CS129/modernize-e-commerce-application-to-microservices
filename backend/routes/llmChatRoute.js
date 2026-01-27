import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/llm-chat", async (req, res) => {
  const { userText } = req.body;

  if (!userText) {
    return res.status(400).json({
      success: false,
      message: "userText required",
    });
  }

  // ----- PROMPT (WATCH THE BACKTICKS) -----
  const prompt = `
You are a multilingual e-commerce voice assistant.

User said: "${userText}"

Return ONLY valid JSON in this exact format:

{
  "action": "navigate | filter | search | add_to_cart | remove_from_cart | update_quantity | sort | checkout | browser_back | browser_forward",
  "navigateTo": "/ | /collection | /cart | /about | /contact | /login | /place-order | null",
  "filters": {
    "category": "Men | Women | Kids | null",
    "subCategory": "Topwear | Bottomwear | Winterwear | null",
    "price_lte": number | null,
    "price_gte": number | null
  },
  "search": string | null,
  "sort": "low-high | high-low | null"
}

Rules:
- "go home" → navigate "/"
- "go to cart" → "/cart"
- "checkout" → "/place-order"
- "sort by price" → "low-high"
- "high to low" → "high-low"
- price under → price_lte
- price above → price_gte
`;

  try {
    const llamaRes = await axios.post(
      "http://127.0.0.1:11434/api/generate",
      {
        model: "mistral",
        prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_ctx: 1024,
          num_predict: 256
        }
      },
      { timeout: 300000 }
    );

    const raw = llamaRes.data.response;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        action: "search",
        navigateTo: "/collection",
        filters: {},
        search: userText,
        sort: null
      };
    }

    res.json({ success: true, response: parsed });

  } catch (err) {
    console.error("LLaMA ERROR:", err.message);
    res.status(500).json({ success: false });
  }
});

export default router;
