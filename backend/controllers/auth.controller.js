import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { redisConnection } from "../lib/redis.js";

import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/generateTokens.js";

import storeRefreshToken from "../services/token.service.js";

import {
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from "../utils/cookie.js";

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Authenticate
        const refreshToken = generateRefreshToken(user._id);
        const accessToken = generateAccessToken(user._id);

        await storeRefreshToken(user._id, refreshToken);
        setAccessTokenCookie(res, accessToken);
        setRefreshTokenCookie(res, refreshToken);

        // Send response (never send password)
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Signup Error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user (explicitly select password)
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Authenticate
        const refreshToken = generateRefreshToken(user._id);
        const accessToken = generateAccessToken(user._id);

        await storeRefreshToken(user._id, refreshToken);
        setAccessTokenCookie(res, accessToken);
        setRefreshTokenCookie(res, refreshToken);

        // Successful login response
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        // If refresh token exists, revoke it
        if (refreshToken) {
            const decoded = jwt.decode(refreshToken);

            if (decoded?.userId) {
                await redisConnection.del(`gg:refresh_token:${decoded.userId}`);
            }
        }

        // Clear cookies
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// This will refresh the access token
const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not provided",
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );

        // Check token against Redis
        const storedToken = await redisConnection.get(
            `gg:refresh_token:${decoded.userId}`,
        );

        if (!storedToken || storedToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token",
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken(decoded.userId);

        // Set new access token cookie
        setAccessTokenCookie(res, accessToken);

        return res.status(200).json({
            success: true,
            accessToken,
        });
    } catch (error) {
        console.error("Refresh token error:", error);

        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export { signup, login, logout, refreshToken, getProfile };
