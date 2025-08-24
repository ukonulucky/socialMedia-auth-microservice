import { RequestHandler } from "express";
import logger from "../utils/logger";
import userModel from "../model/postSchema";
import { createPostValidation, deleteSinglePostValidation, getSinglePostValidation } from "../utils/validate";
import postModel from "../model/postSchema";



// create post
export const createPostController: RequestHandler<{}, {}> = async (req, res) => { 
    logger.info("user hit the create post controller")
    try {
        // validate user input
        const {
            error
        } = createPostValidation(req.body)
        if (error) { 
            logger.error("create post error", error.details[0].message)
            res.status(400).json({
                message: error.details[0].message,
                status: false
            })
        return
        }
        const {content, imageId} = req.body;   


        const newPost = new postModel({
            userId: req.userId,
            content,
            imageId: imageId || []
        })
   await newPost.save()
        logger.info("post created")
        
        res.status(201).json({
            message: "Post created successfuly",
            status: true,
            newPost
        })

    } catch (error) {
        logger.error("Post creation error", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
    
}
// get all post
export const getAllPostController:RequestHandler = async (req, res) => { 
    logger.info("user hit the get all post controller")
    try {
        // get all post
        const posts = await postModel.find({})
    
        res.status(201).json({
            message: "Posts fetched successfuly",
            status: true,
            data: {
               posts
            }
        })
       

    } catch (error) {
        logger.error("get all post error", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
    
}


// get single post
export const getSinglePostController:RequestHandler = async (req, res) => { 
    logger.info("user hit the get single post controller")
    try {
       
    
         // validate user input
         const {
            error
        } = getSinglePostValidation(req.body)
        if (error) { 
            logger.error("get single post error", error.details[0].message)
            res.status(400).json({
                message: error.details[0].message,
                status: false
            })
        return
        }
        const { postId } = req.body
    // get present 
        const post = await  postModel.findById(postId)
      
        logger.info("single post obtained")
  
        res.status(201).json({
            message: "Single post fetched successfull",
            status: true,
            data: {
                post
            }
        })
       

    } catch (error) {
        logger.error("get single post error", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
    
}
export const deleteSinglePostController:RequestHandler = async (req, res) => { 
    logger.info("user hit the delete controller")
    try {
         // validate user input
         const {
            error
        } = deleteSinglePostValidation(req.body)
        if (error) { 
            logger.error("delete single post error", error.details[0].message)
            res.status(400).json({
                message: error.details[0].message,
                status: false
            })
        return
        }

        const { postId } = req.body
      
        const post = await  postModel.findByIdAndDelete(postId)
        

        res.status(201).json({
            message: "Post deleted successfully",
            status: true,
            data: {
                post
            }
        })
       

    } catch (error) {
        logger.error("Post deletion error", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
    
}




