import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [2, "Product name must be at least 2 characters"],
            maxlength: [120, "Product name cannot exceed 120 characters"],
            index: true,
        },

        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
            maxlength: [2000, "Description cannot exceed 2000 characters"],
        },

        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Price cannot be negative"],
        },

        image: {
            type: String,
            required: [true, "Product image is required"],
        },

        imagePublicId: {
            type: String,
            required: [true, "Image public ID is required"],
        },

        category: {
            type: String,
            required: [true, "Product category is required"],
            trim: true,
            lowercase: true,
            index: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Compound index for common queries
productSchema.index({ category: 1, isFeatured: -1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
