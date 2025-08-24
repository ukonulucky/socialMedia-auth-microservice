"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const postRouter = express_1.default.Router();
postRouter.use(authMiddleware_1.authMiddleware); // this middleware will ensure users are authenticated
postRouter.post("/createPost", postController_1.createPostController);
exports.default = postRouter;
