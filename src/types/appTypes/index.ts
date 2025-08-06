export type userSchemaType = {
    _id?: string
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

export type generateTokenType = {
    accessToken : string ,
        expiresAt :Date,
        refreshToken : string
}