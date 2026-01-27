import dotenv from "dotenv";
dotenv.config();

import express from "express";

import authRoutes from "./routes/auth.route.js";
import connectDB from "./lib/db.js";

connectDB();

const app = express();

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server is running on PORT:  ${PORT}`));
