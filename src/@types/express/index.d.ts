// src/@types/express/index.d.ts
import { Redis } from "ioredis";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      redisClient?: import("ioredis").Redis;
      testFlag?: string; // <-- temporary property to test
    }
  }
}

export {};
