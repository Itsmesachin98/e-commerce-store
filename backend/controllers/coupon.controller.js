import Coupon from "../models/coupon.model.js";

const getCoupon = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        const coupon = await Coupon.findOne({
            assignedUser: userId,
            isActive: true,
            expirationDate: { $gt: new Date() },
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "No active coupon found",
            });
        }

        return res.status(200).json({
            success: true,
            coupon,
        });
    } catch (error) {
        console.error("Get Coupon Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user?._id;

        // Validate input & auth
        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required",
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        // Find coupon
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            assignedUser: userId,
            isActive: true,
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found or inactive",
            });
        }

        // Check expiration
        if (coupon.expirationDate <= new Date()) {
            coupon.isActive = false;
            await coupon.save();

            return res.status(410).json({
                success: false,
                message: "Coupon has expired",
            });
        }

        // Valid coupon
        return res.status(200).json({
            success: true,
            message: "Coupon is valid",
            coupon: {
                code: coupon.code,
                discountPercentage: coupon.discountPercentage,
                expirationDate: coupon.expirationDate,
            },
        });
    } catch (error) {
        console.error("Validate Coupon Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export { getCoupon, validateCoupon };
