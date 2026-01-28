import jwt from "jsonwebtoken";

import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No access token provided",
            });
        }

        const decoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET,
        );

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized - Invalid or expired token",
        });
    }
};

const adminRoute = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized - Authentication required",
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Forbidden - Admin access only",
        });
    }

    next();
};

export { protectRoute, adminRoute };
