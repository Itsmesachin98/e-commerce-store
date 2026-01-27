import dotenv from "dotenv";
dotenv.config();

import Redis from "ioredis";

const redisConnection = new Redis(process.env.UPSTASH_REDIS_URL);

redisConnection.on("connect", () => console.log("Redis connecting..."));

redisConnection.on("ready", async () => {
    console.log("Redis connected and ready");
    await redisConnection.set("foo", "bar");
});

redisConnection.on("error", (err) => console.error("Redis error:", err));
redisConnection.on("end", () => console.log("Redis connection closed"));

const connectRedis = async () => {
    // ioredis auto-connects, so you don't need redisConnection.connect()
    // but we keep this function for your project structure consistency
    return redisConnection;
};

connectRedis();

export { redisConnection, connectRedis };
