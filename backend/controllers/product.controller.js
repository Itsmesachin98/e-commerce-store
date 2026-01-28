import Product from "../models/product.model.js";
import { redisConnection } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

const createProduct = async (req, res) => {
    let uploadedImage = null; // keep reference for cleanup

    try {
        const { name, description, price, image, category } = req.body;

        // Validation
        if (!name || !description || !price || !category || !image) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Upload image to Cloudinary
        uploadedImage = await cloudinary.uploader.upload(image, {
            folder: "products",
        });

        // Create product in DB
        const product = await Product.create({
            name,
            description,
            price,
            image: uploadedImage.secure_url,
            category,
        });

        // Invalidate cache
        await redisConnection.del("gg:featured_products");

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error("Error in createProduct controller:", error);

        // TRANSACTION SAFETY: cleanup Cloudinary image
        if (uploadedImage?.public_id) {
            try {
                await cloudinary.uploader.destroy(uploadedImage.public_id);
                console.log("Cloudinary image rolled back successfully");
            } catch (cleanupError) {
                console.error(
                    "Failed to cleanup Cloudinary image:",
                    cleanupError,
                );
            }
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).lean();

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.error("Error in getAllProducts controller:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getFeaturedProducts = async (req, res) => {
    try {
        const CACHE_KEY = "gg:featured_products";

        // Check Redis cache
        const cachedProducts = await redisConnection.get(CACHE_KEY);

        if (cachedProducts) {
            return res.status(200).json({
                success: true,
                source: "cache",
                products: JSON.parse(cachedProducts),
            });
        }

        // Fetch from MongoDB if cache miss
        const featuredProducts = await Product.find({
            isFeatured: true,
            isActive: true,
        })
            .sort({ createdAt: -1 })
            .lean();

        if (featuredProducts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No featured products found",
            });
        }

        // Store in Redis (with TTL)
        await redisConnection.set(
            CACHE_KEY,
            JSON.stringify(featuredProducts),
            "EX",
            60 * 10, // 10 minutes
        );

        return res.status(200).json({
            success: true,
            source: "db",
            products: featuredProducts,
        });
    } catch (error) {
        console.error("Error in getFeaturedProducts controller:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export { createProduct, getAllProducts, getFeaturedProducts };
