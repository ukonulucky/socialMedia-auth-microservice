import { Request, RequestHandler, Response } from "express";
import logger from "../utils/logger";
import { createPostValidation, deleteSinglePostValidation, getSinglePostValidation } from "../utils/validate";
import postModel from "../model/postSchema";
import { CustomDeleteRequest, CustomRequest } from "../types";
import { isMongoDbIdValidFunc } from "../utils/isMongooseIdValid";

interface CustomCreatePostRequest extends Request {
    userId?: string;
}


// create post
export const createPostController : RequestHandler = async (req:CustomCreatePostRequest, res:Response) => { 
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
export const getAllPostController:RequestHandler = async (req:CustomRequest, res:Response) => { 
    logger.info("user hit the get all post controller")
    try {
        // set pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const startIndex = (page - 1) * 10
        // getting cached data from redis
        const cachedKey = `posts:${page}:${limit}`;
        const cachedPosts = await req.redisClient?.get(cachedKey)

        if (cachedPosts) { 
           const newData = JSON.parse(cachedPosts)
            return res.status(200).json({
                message: "Posts fetched successfuly",
            status: true,
            data: newData
            })
        }

        // get all post
        const posts = await postModel.find({}).sort({
            createdAt: -1
        }).skip(startIndex).limit(limit)

        // get total post

        const totalNoOfPost = await postModel.countDocuments()
        
        const result = {
            posts,
            currentpage: page,
            totalPage: Math.ceil(totalNoOfPost / limit),
            totalPost : totalNoOfPost
        }
        // store the new data to redis cach
    await req.redisClient?.setex(cachedKey,5,JSON.stringify(result))
        res.status(201).json({
            message: "Posts fetched successfuly",
            status: true,
            data: {
               result
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
export const getSinglePostController:RequestHandler = async (req:CustomRequest, res:Response) => { 
    logger.info("user hit the get single post controller")
    try {
       
        const postId = req.params.postId
        if (!postId) { 
            logger.error("get single post error, postId not found", )
            res.status(400).json({
                message: "post Id is required",
                status: false
            })
        return
        }
        const isPostIdValid = isMongoDbIdValidFunc(postId)
        if (!isPostIdValid) { 
            return res.status(400).json({
                message: "Invalid post Id",
                status: false
            })
             }
         // validate user input
      
      
  
        // check if post exist in redis cach

        const cachedKey = `posts:${postId}`;
        const cachedPost = await req.redisClient?.get(cachedKey)

        if (cachedPost) { 
            const newData = JSON.parse(cachedPost)
            return res.status(200).json({
                message: "Posts fetched successfuly",
            status: true,
            data: newData
            })
        }
    // get present 
        const post = await postModel.findById(postId)
        
        // save post to redis cach

           // store the new data to redis cach
    await req.redisClient?.setex(cachedKey,5,JSON.stringify(post))
      
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
export const deleteSinglePostController:RequestHandler = async (req:CustomDeleteRequest, res:Response) => { 
    logger.info("user hit the delete controller")
    try {


         // validate user input
         const postId = req.params.postId
         if (!postId) { 
             logger.error("get single post error, postId not found", )
             res.status(400).json({
                 message: "post Id is required",
                 status: false
             })
         return
         }
         const isPostIdValid = isMongoDbIdValidFunc(postId)
         if (!isPostIdValid) { 
             return res.status(400).json({
                 message: "Invalid post Id",
                 status: false
             })
              }

      

      // we use the userId and postId to delete a single post only if post was created by the user intending to delete the post
        const deletedPost = await postModel.findOneAndDelete({
            userId: req.userId,
            _id: postId
        })

        if (!deletedPost) { 
          return res.status(404).json({
                status: false,
                message:"post not found"
            })

        }
        
          // delete post if exist in cach
          const cachedKey = `posts:${postId}`;
        await req.redisClient?.del(cachedKey)
        res.status(200).json({
            status: false,
            message:"post deleted successfully"
        })


    } catch (error) {
        logger.error("Post deletion error", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
    
}




