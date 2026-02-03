import { create } from "zustand";
import { toast } from "react-hot-toast";

import axios from "../lib/axios";

const useUserStore = create((set) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    checkAuth: async () => {
        set({ checkingAuth: true });

        try {
            const res = await axios.get("/auth/profile");
            set({ user: res.data.user, checkingAuth: false });
        } catch (error) {
            console.error("Auth check failed:", error);
            set({ user: null, checkingAuth: false });
        }
    },

    signup: async ({ name, email, password, confirmPassword }) => {
        // Start loading
        set({ loading: true });

        // ---- Input Validation ----
        if (!name?.trim()) {
            set({ loading: false });
            return toast.error("Full name is required");
        }

        if (!email?.trim()) {
            set({ loading: false });
            return toast.error("Email is required");
        }

        if (!password) {
            set({ loading: false });
            return toast.error("Password is required");
        }

        if (password !== confirmPassword) {
            set({ loading: false });
            return toast.error("Passwords do not match");
        }

        try {
            const res = await axios.post("/auth/signup", {
                name: name.trim(),
                email: email.trim(),
                password,
            });

            set({
                user: res.data.user,
                loading: false,
            });

            toast.success(res.data.message || "Signup successful");
            return res.data.user;
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                "Something went wrong. Please try again.";

            set({ loading: false });
            toast.error(message);
        }
    },

    login: async (email, password) => {
        // Start loading
        set({ loading: true });

        // ---- Input Validation ----
        if (!email?.trim()) {
            set({ loading: false });
            return toast.error("Email is required");
        }

        if (!password) {
            set({ loading: false });
            return toast.error("Password is required");
        }

        try {
            const res = await axios.post("/auth/login", {
                email: email.trim(),
                password,
            });

            set({
                user: res.data.user,
                loading: false,
            });

            toast.success(res.data.message || "Login successful");
            return res.data.user;
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                "Something went wrong. Please try again.";

            set({ loading: false });
            toast.error(message);
        }
    },

    logout: async () => {
        try {
            await axios.post("/auth/logout");

            set({ user: null });

            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout Error:", error);

            toast.error(
                error?.response?.data?.message ||
                    "Failed to logout. Please try again.",
            );
        }
    },
}));

// TODO: Implement the axios interceptors for refreshing the access token

export default useUserStore;
