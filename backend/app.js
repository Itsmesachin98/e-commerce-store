import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";

import connectDB from "./lib/db.js";
import { connectRedis } from "./lib/redis.js";

connectDB();

(async () => {
    try {
        await connectRedis();
    } catch (err) {
        console.error("Redis failed to connect", err);
        process.exit(1);
    }
})();

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

app.listen(PORT, () => console.log(`Server is running on PORT:  ${PORT}`));
