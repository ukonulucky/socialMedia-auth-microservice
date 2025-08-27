import { Request } from "express";
import { Redis } from "ioredis"
import mongoose from "mongoose"

export interface CustomRequest extends Request {
    redisClient?: Redis;
}


export interface CustomDeleteRequest extends Request {
    redisClient?: Redis;
    userId?: string
}


interface CustomCreatePostRequest extends Request {
    userId?: string;
}

export type postSchemaType = {
 userId: MongooseIdType
    content: string,
    imageId: string,
    createdAt?: string
}

export type createPostType = {
    content: string,
    imageId?: string
}
export type getSinglePostType = {
    postId: string,
 
}
export type MongooseIdType = mongoose.Types.ObjectId;



