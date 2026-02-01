import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: [1, "Quantity must be at least 1"],
                },

                price: {
                    type: Number,
                    required: true,
                    min: [0, "Price cannot be negative"],
                },
            },
        ],

        totalAmount: {
            type: Number,
            required: true,
            min: [0, "Total amount cannot be negative"],
        },

        stripeSessionId: {
            type: String,
            unique: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
