import Joi from "joi"
import { createPostType } from "../types/appTypes"





export const createPostValidation = (data: createPostType) => { 
    const schema = Joi.object({
        content: Joi.string().email().required()
    })
    return schema.validate(data)
}
export const getSinglePostValidation = (data: createPostType) => { 
    const schema = Joi.object({
        postId: Joi.string().email().required()
    })
    return schema.validate(data)
}

export const deleteSinglePostValidation = (data: createPostType) => { 
    const schema = Joi.object({
        postId: Joi.string().email().required()
    })
    return schema.validate(data)
}
