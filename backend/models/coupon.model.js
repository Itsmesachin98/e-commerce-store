import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true,
            trim: true,
            minlength: [3, "Coupon code must be at least 3 characters"],
            maxlength: [20, "Coupon code cannot exceed 20 characters"],
            index: true,
        },

        discountPercentage: {
            type: Number,
            required: [true, "Discount percentage is required"],
            min: [1, "Discount must be at least 1%"],
            max: [100, "Discount cannot exceed 100%"],
        },

        expirationDate: {
            type: Date,
            required: [true, "Expiration date is required"],
            validate: {
                validator: (value) => value > Date.now(),
                message: "Expiration date must be in the future",
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        assignedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Prevent multiple coupons with same code
couponSchema.index({ code: 1 }, { unique: true });

// One coupon per user (remove if not needed)
couponSchema.index({ assignedUser: 1 }, { unique: true });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
