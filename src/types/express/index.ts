// @types/express/index.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string; // Added userId custom field to the request globally

    }
  }
}
