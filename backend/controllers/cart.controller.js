import Product from "../models/product.model.js";

const getCartProducts = async (req, res) => {};

// POST /api/cart
const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        // Validate input
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }

        // Ensure product exists & is active
        const product = await Product.findOne({
            _id: productId,
            isActive: true,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Check if product already in cart
        const existingItem = user.cartItems.find(
            (item) => item.product.toString() === productId,
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push({
                product: productId,
                quantity: 1,
            });
        }

        // Save user
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cartItems: user.cartItems,
        });
    } catch (error) {
        console.error("Error in addToCart controller:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// DELETE /api/cart
const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }

        user.cartItems = user.cartItems.filter(
            (item) => item.product.toString() !== productId,
        );

        // Persist changes
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cartItems: user.cartItems,
        });
    } catch (error) {
        console.error("Error in removeAllFromCart controller:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const updateQuantity = async (req, res) => {};

export { getCartProducts, addToCart, removeAllFromCart, updateQuantity };
