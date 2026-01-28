import Product from "../models/product.model.js";

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

export { getAllProducts };
