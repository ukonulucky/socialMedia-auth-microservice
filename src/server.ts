import dotenv from "dotenv"
dotenv.config()
import cors from "cors"
import express, { NextFunction, Request, Response } from "express"
import logger from "./utils/logger"
import dbConnectFunc from "./confiq/dbConnect"
import helmet from "helmet"
import { RateLimiterRedis } from "rate-limiter-flexible"
import { connectRedisDbFunc } from "./confiq/connectRedis"
import postRouter from "./routes/postRoutes"

import { Redis } from "ioredis"

const app = express()
const PORT = process.env.PORT || 5000
console.log("environment variables", process.env.REDIS_URL)
// middleware 
app.use(helmet())
app.use(cors())
app.use(express.json())

interface CustomRequest extends Request {
    redisClient?: Redis;
}


app.use((req: CustomRequest, res: Response, next: NextFunction) => {
    req.redisClient = redisClient;
    next();
});




// setting up a redis client
const redisClient = connectRedisDbFunc()

// setup a rate limiter for redis
const redisRateLimitClient = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "rateLimitRedis",
    duration: 1,
    points: 5
})



// create a middleware for the radis rate limiter
app.use(async (req, res, next) => { 
    try {
       logger.warn("Checking for rate limit")
    if(!req.ip) throw new Error("req.ip not found")
         await redisRateLimitClient.consume(req.ip)
       next()
   } catch (error) {
       res.status(429).json({
           message:`Error in connecting to redis:, ${error}`
       })
   }
})


app.use((req, res, next) => { 
    logger.info(`request from ${req.url} having a method of ${req.method}`)
    next()
})

//endpoints


app.get("/", (req, res) => { 
    console.log("Root route accessed");
    res.send(`Server for product running on port ${PORT}`)
 })
app.use("/api/post", (req:CustomRequest, res, next) => {
    req.redisClient = redisClient 
    next()
 }, postRouter)



app.listen(PORT, async() => { 
    try {
     
        const res = await dbConnectFunc()
        if (res) { 
            logger.info("MongoDb  connected successfully")
        }
        logger.info(`App started at port ${PORT}`)
        
    } catch (error) {
        logger.error(`Application error, ${error}`)
        console.log(`Application erorr occured`, error)
        process.exit()
    }
})