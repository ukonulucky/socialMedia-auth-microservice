import express from "express"
import { createPostController } from "../controllers/postController"
import { authMiddleware } from "../middleware/authMiddleware"

const postRouter = express.Router()

postRouter.use(authMiddleware) // this middleware will ensure users are authenticated

postRouter.post("/createPost", createPostController)


export default postRouter