import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

const useProductStore = create((set, get) => ({
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

    // GET /api/products
    fetchAllProducts: async () => {
        set({ loading: true });

        try {
            const res = await axios.get("/products");

            set({ products: res?.data?.products || [] });
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to fetch products";

            set({ products: [] });
            toast.error(message);
        } finally {
            set({ loading: false });
        }
    },

    // DELETE /api/products/:id
    deleteProduct: async (productId) => {
        set({ loading: true });

        try {
            await axios.delete(`/products/${productId}`);

            set((state) => ({
                products: state.products.filter(
                    (product) => product._id !== productId,
                ),
            }));

            toast.success("Product deleted successfully");
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to delete product";

            toast.error(message);
        } finally {
            set({ loading: false });
        }
    },

    // PATCH /api/products/:id
    toggleFeaturedProduct: async (productId) => {
        set({ loading: true });

        try {
            const res = await axios.patch(`/products/${productId}`);

            set((state) => ({
                products: state.products.map((product) =>
                    product._id === productId
                        ? {
                              ...product,
                              isFeatured: res?.data?.product?.isFeatured,
                          }
                        : product,
                ),
            }));

            console.log("This is products: ", get().products);
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to update product";

            toast.error(message);
        } finally {
            set({ loading: false });
        }
    },
}));

export default useProductStore;
