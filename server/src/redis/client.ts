import { Redis } from "ioredis";

const REDIS_URI = process.env.REDIS_URI ?? "redis://:admin@localhost:6379/0";

export const redis = new Redis(REDIS_URI);
