import { NextFunction, Request, RequestHandler, Response } from "express";

interface CustomRequest extends Request {
    userId?: string;
}


export const authMiddleware: RequestHandler = (req: CustomRequest, res:Response, next: NextFunction) => { 
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