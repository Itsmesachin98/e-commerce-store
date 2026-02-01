import { create } from "zustand";
import { toast } from "react-hot-toast";

import axios from "../lib/axios";

const useUserStore = create((set) => ({
    user: null,
    loading: false,
    checkingAuth: true,

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
}));

export default useUserStore;
