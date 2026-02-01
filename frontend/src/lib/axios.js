import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true, // Send cookies to the server
});

export default axiosInstance;
