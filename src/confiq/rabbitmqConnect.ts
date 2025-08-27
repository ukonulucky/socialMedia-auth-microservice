import * as amqplib from "amqplib"
import { Connection, Channel } from 'amqplib';
import logger from "../utils/logger"


 const exchangeName ="socialApp"
 let rabitConnection: Connection | null = null
let rabitChannel: Channel | null = null
 
export async function connectToRabbitMqFunc() {
logger.info("Connection to rabbitmq started")
    try {
        // connect to rabitmq local server
       
 rabitConnection = await amqplib.connect(process.env.RABBITMQ_URL as string) 
        // create a channel for communication after the connection
        if (!rabitConnection) { 
            throw new Error("Failed to establish RabbitMQ connection");
        }
        rabitChannel = await rabitConnection.createChannel()
        await rabitChannel?.assertExchange(exchangeName, "topic", { durable: false })
        logger.info("Rabbitmq connection made successfully")
    } catch (error) {
        logger.error("Error connecting to rabbitmq:", error)
        console.log("Error connecting to rabbitmq:", error)
    }
    
}


async function publicMessageRabitmq(message: string, routingKey: string) {

    try {
       logger.info("Attempting publishing message")
     // reconnect if no channel is found
     if (!rabitChannel) { 
        await connectToRabbitMqFunc()
     }
     rabitChannel?.publish(exchangeName, routingKey, Buffer.from(message));
     
   } catch (error) {
        logger.warn("RabitMq Error in publishing message", error)
        throw new Error("RabitMq Error in publishing message")
   }
    
}