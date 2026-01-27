import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  const response = await axios.post(
    "http://127.0.0.1:5000/tryon",
    req.body
  );
  res.json(response.data);
});

export default router;
