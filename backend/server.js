import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import tryOnRouter from "./routes/tryOnRoute.js";
import llmChatRouter from "./routes/llmChatRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 4000;

// DB & Cloud
connectDB();
connectCloudinary();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));


// Routes
app.use("/api/tryon", tryOnRouter);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api", llmChatRouter);

// Health check
app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () =>
  console.log("Server started on PORT : " + port)
);
