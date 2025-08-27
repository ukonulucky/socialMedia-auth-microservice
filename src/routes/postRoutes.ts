import express from "express"
import { createPostController, deleteSinglePostController, getAllPostController, getSinglePostController } from "../controllers/postController"
import { authMiddleware } from "../middleware/authMiddleware"

const postRouter = express.Router()

postRouter.use(authMiddleware) // this middleware will ensure users are authenticated

postRouter.post("/createPost", createPostController)
postRouter.get("/getPosts", getAllPostController)
postRouter.get("/getPost/:postId", getSinglePostController)
postRouter.delete("/deletePost/:postId", deleteSinglePostController)


export default postRouter