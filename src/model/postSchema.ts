import mongoose, { Mongoose } from "mongoose";
import { postSchemaType } from "../types/appTypes";



const postSchema = new mongoose.Schema<postSchemaType>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        unique: true
    },
    imageId: [{
        type: String,
        required: true,
    }],
    createdAt: {
        type: Date,
        Default: Date.now()
    }

}, {
    timestamps:true
})

// enables us to filter the entire datbase based on a given content

postSchema.index({
    content: "text"
})
const postModel = mongoose.model("post", postSchema)

export default postModel