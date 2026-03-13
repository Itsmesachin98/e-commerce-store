import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

const useProductStore = create((set) => ({
    products: [],
    loading: false,
    setProducts: (products) => set({ products }),

    // POST /api/products
    createProduct: async (productData) => {
        set({ loading: true });

        try {
            const res = await axios.post("/products", productData);

            set((state) => ({
                products: [...state.products, res.data],
            }));

            toast.success("Product created successfully");
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to create product";

            toast.error(message);
        } finally {
            set({ loading: false });
        }
    },
}));

export default useProductStore;
