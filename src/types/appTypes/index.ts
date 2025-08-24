import mongoose from "mongoose"




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



