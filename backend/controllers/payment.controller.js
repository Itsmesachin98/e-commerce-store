import stripe from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

// POST /api/payments/create-checkout-session
const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty products array",
            });
        }

        let totalAmount = 0;

        const lineItems = products.map((product) => {
            const amount = Math.round(product.product.price * 100);
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.product.name,
                        images: [product.product.image],
                    },
                    unit_amount: amount,
                },
                quantity: product.quantity || 1,
            };
        });

        // Handle coupon
        let coupon = null;

        if (couponCode) {
            coupon = await Coupon.findOne({
                code: couponCode,
                assignedUser: req.user._id,
                isActive: true,
            });

            if (coupon) {
                const discount = Math.round(
                    (totalAmount * coupon.discountPercentage) / 100,
                );

                totalAmount -= discount;
            }
        }

        // Create stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon
                ? [
                      {
                          coupon: await createStripeCoupon(
                              coupon.discountPercentage,
                          ),
                      },
                  ]
                : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(
                    products.map((item) => ({
                        id: item.product._id,
                        quantity: item.quantity,
                        price: item.product.price,
                    })),
                ),
            },
        });

        // Reward coupon logic
        if (totalAmount >= 20000) await createNewCoupon(req.user._id);

        res.status(200).json({
            success: true,
            id: session.id,
            totalAmount: totalAmount / 100,
        });
    } catch (error) {
        console.error("Checkout error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Error processing checkout",
        });
    }
};

// POST /api/payments/checkout-success
const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;

        // Validate input
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Session ID is required",
            });
        }

        // Retrieve Stripe session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session || session.payment_status !== "paid") {
            return res.status(400).json({
                success: false,
                message: "Payment not completed",
            });
        }

        // Prevent duplicate orders
        const existingOrder = await Order.findOne({
            stripeSessionId: sessionId,
        });

        if (existingOrder) {
            return res.status(200).json({
                success: true,
                message: "Order already exists",
                orderId: existingOrder._id,
            });
        }

        // Parse products safely
        let products;

        try {
            products = JSON.parse(session.metadata.products);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: "Invalid product data in metadata",
            });
        }

        // Handle coupon
        if (session.metadata.couponCode) {
            await Coupon.findOneAndUpdate(
                {
                    code: session.metadata.couponCode,
                    assignedUser: session.metadata.userId,
                },
                { isActive: false },
            );
        }

        // Create order
        const order = new Order({
            user: session.metadata.userId,
            products: products.map((product) => ({
                product: product.id,
                quantity: product.quantity,
                price: product.price,
            })),
            totalAmount: session.amount_total / 100,
            stripeSessionId: sessionId,
        });

        await order.save();

        // Clear cart
        const userId = session.metadata.userId;
        await User.findByIdAndUpdate(userId, { $set: { cartItems: [] } });

        return res.status(200).json({
            success: true,
            message: "Payment successful and order created",
            orderId: order._id,
        });
    } catch (error) {
        console.error("Checkout success error: ", error);

        return res.status(500).json({
            success: false,
            message: "Error processing checkout",
        });
    }
};

// Create Stripe Coupon
async function createStripeCoupon(discountPercentage) {
    try {
        const coupon = await stripe.coupons.create({
            percent_off: discountPercentage,
            duration: "once",
        });

        return coupon.id;
    } catch (error) {
        console.error("Stripe coupon creation failed:", error);
        throw error;
    }
}

// Create New Coupon in DB
async function createNewCoupon(userId) {
    try {
        if (!userId) throw new Error("User ID is required");

        // Remove existing coupon (one active coupon per user)
        await Coupon.findOneAndDelete({ assignedUser: userId });

        // Generate secure coupon code
        const code =
            "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase();

        const newCoupon = new Coupon({
            code,
            discountPercentage: 10,
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            assignedUser: userId,
        });

        await newCoupon.save();

        return newCoupon;
    } catch (error) {
        console.error("Error creating new coupon:", error);
        throw error;
    }
}

export { createCheckoutSession, checkoutSuccess };
