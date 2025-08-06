import { RequestHandler } from "express";
import logger from "../utils/logger";
import { registerValidation } from "../utils/validate";
import userModel from "../model/userSchema";
import { ref } from "process";
import refreshTokenModal from "../model/refreshToken";
import { generateToken  } from "../utils/generateToken";

// register user
export const registerUserController:RequestHandler = async (req, res) => { 
    logger.info("user hit the register controller")
    try {
        // validate user input
        const {
            error
        } = registerValidation(req.body)
        if (error) { 
            logger.error("user registration error", error.details[0].message)
            res.status(400).json({
                message: error.details[0].message,
                status: false
            })
        return
        }
        const newUser = new userModel({
            email: req.body.email,
            userName: req.body.userName,
            password:req.body.password
        })

      const user =  await newUser.save()
        logger.info("user created")
        // create token

        const {
            accessToken,
            expiresAt,
            refreshToken
         }  = generateToken(user)
        new refreshTokenModal({
            accessToken,
            expiresAt,
            refreshToken
        })
        logger.warn("new refresh token schema created")
        res.status(201).json({
            message: "User created successfuly",
            status: true,
            accessToken,
            refreshToken
        })

    } catch (error) {
        logger.error("Registration error", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
    
}

// login user


