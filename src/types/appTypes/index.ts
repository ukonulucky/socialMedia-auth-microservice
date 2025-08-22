import mongoose from "mongoose"

export type userSchemaType = {
    _id?: MongooseIdType
    userName: string,
    email: string,
    createdAt?: string,
    password: string,
    comparePassword: (userPassword: string) => boolean
}

export type userRegisterType = {
    userName: string,
    email: string,
    password: string,

}
export type userLoginType = {
    email: string,
    password: string,

}
export type MongooseIdType = mongoose.Types.ObjectId;

export type generateTokenType = {
    accessToken : string ,
        expiresAt :Date,
        userId : MongooseIdType
}



