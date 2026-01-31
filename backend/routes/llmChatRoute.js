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


Decide EXACTLY ONE primary action.

Rules (follow strictly):

NAVIGATION:
home → "/"
cart → "/cart"
about → "/about"
contact → "/contact"
login → "/login"
checkout → "/place-order"

SORT:
"low to high" → "low-high"
"high to low" → "high-low"

PRICE:
"under", "below", "cheap" → price_lte
"above", "expensive" → price_gte

PRODUCT WORDS → action="search"

Return ONLY JSON:

{
 "action": "navigate|filter|search|add_to_cart|remove_from_cart|update_quantity|sort|checkout|browser_back|browser_forward",
 "navigateTo": "/|/collection|/cart|/about|/contact|/login|/place-order|null",
 "filters": {
   "category": "Men|Women|Kids|null",
   "subCategory": "Topwear|Bottomwear|Winterwear|null",
   "price_lte": number|null,
   "price_gte": number|null
 },
 "search": string|null,
 "sort": "low-high|high-low|null"
}
`;

  try {
 const llamaRes = await axios.post(
  "http://127.0.0.1:8080/completion",
  {
    prompt: prompt,
    n_predict: 80,
    sampling_params: {
      temp: 0.1,
      top_k: 40,
      top_p: 0.9,
      repeat_penalty: 1.1
    }
  },
  {
    headers: { "Content-Type": "application/json" }
  }
);


const raw = llamaRes.data.content.trim();
console.log("RAW OUTPUT:",raw)
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
