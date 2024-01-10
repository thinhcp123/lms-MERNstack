import Redis from "ioredis";

require("dotenv").config();

const redisClient = () => {
    if (process.env.UPSTASH_REDIS_REST_URL) {
        console.log('redis connected');
        return process.env.UPSTASH_REDIS_REST_URL
    }
    throw new Error('Redis connection fail')
}

export const redis = new Redis(redisClient())