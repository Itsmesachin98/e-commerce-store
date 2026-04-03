import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const useCartStore = create((set, get) => ({
    cart: [],
    total: 0,
    subtotal: 0,

    coupon: null,
    isCouponApplied: false,

    getMyCoupon: async () => {
        try {
            const response = await axios.get("/coupons");
            set({ coupon: response.data.coupon });
        } catch (error) {
            console.error("Error fetching coupon:", error);
        }
    },

    applyCoupon: async (code) => {
        try {
            const response = await axios.post("/coupons/validate", { code });
            set({ coupon: response.data.coupon, isCouponApplied: true });
            get().calculateTotals();
            toast.success("Coupon applied successfully");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to apply coupon",
            );
        }
    },

    removeCoupon: () => {
        set({ coupon: null, isCouponApplied: false });
        get().calculateTotals();
        toast.success("Coupon removed");
    },

    // GET /api/cart
    getCartItems: async () => {
        try {
            const res = await axios.get("/cart");
            set({ cart: res?.data?.cartItems || [] });
            get().calculateTotals();
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to fetch cart items";

            set({ cart: [] });
            toast.error(message);
        }
    },

    // POST /ap/cart
    addToCart: async (product) => {
        try {
            const res = await axios.post("/cart", { productId: product._id });
            set({ cart: res?.data?.cartItems || [] });
            get().calculateTotals();
            toast.success("Product added to cart");
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to add product to cart";

            toast.error(message);
        }
    },

    // DELETE /api/cart
    removeFromCart: async (productId) => {
        try {
            await axios.delete(`/cart`, { data: { productId } });

            set((state) => ({
                cart: state.cart.filter(
                    (item) => item.product._id !== productId,
                ),
            }));

            get().calculateTotals();
            toast.success("Product removed from cart");
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to remove product from cart";

            toast.error(message);
        }
    },

    // PUT /api/cart/:productId
    updateQuantity: async (productId, quantity) => {
        if (quantity === 0) {
            return get().removeFromCart(productId);
        }

        try {
            await axios.put(`/cart/${productId}`, { quantity });

            set((state) => ({
                cart: state.cart.map((item) =>
                    item.product._id === productId
                        ? { ...item, quantity }
                        : item,
                ),
            }));

            get().calculateTotals();
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to update quantity";

            toast.error(message);
        }
    },

    clearCart: () => {
        set({ cart: [], coupon: null, total: 0, subtotal: 0 });
    },

    calculateTotals: () => {
        const { cart, coupon } = get();

        const subtotal = cart.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0,
        );
        let total = subtotal;

        if (coupon) {
            const discount = subtotal * (coupon.discountPercentage / 100);
            total = subtotal - discount;
        }

        set({ subtotal, total });
    },
}));

export default useCartStore;
