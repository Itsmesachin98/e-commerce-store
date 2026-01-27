import { redisConnection } from "../lib/redis.js";

redisConnection;

const storeRefreshToken = async (userId, refreshToken) => {
    redisConnection.set(
        `gg:refresh_token:${userId}`,
        refreshToken,
        "EX",
        7 * 24 * 60 * 60, // 7 days
    );
};

export default storeRefreshToken;
