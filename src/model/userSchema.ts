import mongoose from "mongoose";
import argon2 from "argon2"
import { userSchemaType } from "../types/appTypes";



const userSchema = new mongoose.Schema<userSchemaType>({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        Default: Date.now()
    }

}, {
    timestamps:true
})


userSchema.pre("save", async function (next) { 
    try {
        if (this.isModified("password")) { 
            this.password = await argon2.hash(this.password)
            await this.save()
            next()
        }
    } catch (error:any) {
        next(error)
    }
})

userSchema.methods.comparePassword = async function (userPassword: string) { 
   try {
    return await argon2.verify(this.password,userPassword )
   } catch (error: any) {
    throw new Error(error)
   }
}


// enables one to carry out text search on the field userName
userSchema.index({
    userName: "text"
})
const userModel = mongoose.model("User", userSchema)

export default userModel