import { RequestHandler } from "express";
import logger from "../utils/logger";
import { loginValidation, registerValidation } from "../utils/validate";
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
        const { email, userName, password } = req.body;
  console.log(`this is the body ${email}`)
        // Check if user already exists
        const existingUser = await userModel.findOne({
            $or: [{email}, {userName}]
        });
        console.log("this is the existingUser", existingUser)
        if (existingUser) {
          logger.warn("Attempted registration with existing email");
          return res.status(409).json({
            message: "User with this email or userName already exists",
            status: false,
          });
        }


        const user = new  userModel({
            email: email,
            userName: userName,
            password:password
        })
  const newUser = await user.save()
        logger.info("user created")
        // create token

        const {
            accessToken,
            expiresAt,
            userId
        } = generateToken(newUser)
        console.log("data returned",accessToken, expiresAt, userId)
     const newRefreshToken =   new refreshTokenModal({
            accessToken,
            expiresAt,
            userId
     }) 
        await newRefreshToken.save()
       logger.warn("new refresh token schema created")
        res.status(201).json({
            message: "User created successfuly",
            status: true,
            newUser
        })

    } catch (error) {
        logger.error("Registration error", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
    
}
// register user
export const loginUserController:RequestHandler = async (req, res) => { 
    logger.info("user hit the login controller")
    try {
        // validate user input
        const {
            error
        } = loginValidation(req.body)
        if (error) { 
            logger.error("user login error", error.details[0].message)
            res.status(400).json({
                message: error.details[0].message,
                status: false
            })
        return
        }
        const { email, password } = req.body;

        const user = await  userModel.findOne({
            email: email
        })
        if (!user) { 
            logger.warn("Attempted login with invalid email");
          return res.status(409).json({
            message: "User with this email does not exists",
            status: false,
          });

        }
        // check if passoword match

        const isPasswordCorrect = await user.comparePassword(password)

        if (!isPasswordCorrect) { 
            return res.status(401).json({
                message: "Invalid user email/password",
                status: false,
              });
        }
        logger.warn("user logged in successfully")
        const {
            accessToken,
            expiresAt,
            userId
        } = generateToken(user)

        const newRefreshToken =   new refreshTokenModal({
            accessToken,
            expiresAt,
            userId
     }) 
        await newRefreshToken.save()
       logger.warn("new refresh token schema created for the login controller")
      
        res.status(201).json({
            message: "User loggedIn successfuly",
            status: true,
            data: {
                accessToken,
                expiresAt 
            }
        })
       

    } catch (error) {
        logger.error("Registration error", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
    
}
// refreshToken Controller
export const refreshTokenController:RequestHandler = async (req, res) => { 
    logger.info("user hit the rereshToken controller")
    try {
        // validate user input
        const {
            refreshToken
        } = req.body
        if (!refreshToken) { 
            logger.error("user refreshToken error, refreshToken not found")
            res.status(400).json({
                message: "refreshToken not found",
                status: false
            })
        return
        }
      
    // check if refresh token exist and is valid
        const token = await  refreshTokenModal.findOne({
           refreshToken
        })
        if (!token || token.expiresAt < new Date()) { 
            logger.warn("Invalid refreshToken");
          return res.status(409).json({
            message: "Invalid refresh token",
            status: false,
          });

        }

        // delete previous refreshToken and create a new one

        const deleteRefreshToken = await refreshTokenModal.deleteOne({
            accessToken: token.accessToken
        })
     

        // get present user saved

        const user = await userModel.findById(token.userId)
        if (!user) {
          logger.error("No user associated with the token")
            return  res.status(409).json({
                message: "Invalid refresh token",
                status: false,
              });
         }
       
        logger.warn("generating  a new refeshToken")
        const {
            accessToken,
            expiresAt,
            userId
        } = generateToken(user)

        const newRefreshToken =   new refreshTokenModal({
            accessToken,
            expiresAt,
            userId
     }) 
        await newRefreshToken.save()
       logger.warn("new refresh token schema created for the refreshToken controller")
      
        res.status(201).json({
            message: "User refreshToken created successfuly",
            status: true,
            data: {
                accessToken,
                expiresAt 
            }
        })
       

    } catch (error) {
        logger.error("Registration error", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
    
}
export const logOutUserController:RequestHandler = async (req, res) => { 
    logger.info("user hit the logout controller")
    try {
        // validate user input
        const {
            refreshToken
        } = req.body
        if (!refreshToken) { 
            logger.error("user refreshToken error, refreshToken not found")
            res.status(400).json({
                message: "refreshToken not found",
                status: false
            })
        return
        }
      
        const token = await  refreshTokenModal.findOneAndDelete({
           refreshToken
        })
        if (!token) { 
            logger.warn("Failed to logout user")
            return res.status(409).json({
                message: "token not found, failed to log user out",
                status: false
            })
        }

        res.status(201).json({
            message: "User logged out successfuly",
            status: true,
        })
       

    } catch (error) {
        logger.error("Registration error", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
    
}




