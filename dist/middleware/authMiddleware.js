"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    const userId = req.headers["x-user-id"];
    if (!userId) {
        return res.status(401).json({
            status: false,
            message: "Authentication required, please kindly login"
        });
    }
    req.userId = userId;
    next();
};
exports.authMiddleware = authMiddleware;
