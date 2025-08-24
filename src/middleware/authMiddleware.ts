import { RequestHandler } from "express";
import { MiddlewareOptions } from "mongoose";


export const authMiddleware: RequestHandler = (req, res, next) => { 
    const userId = req.headers["x-user-id"]
    if (!userId) {
        return res.status(401).json({
            status: false,
            message:"Authentication required, please kindly login"
        })
    }
    req.userId = userId as string

    next()
}