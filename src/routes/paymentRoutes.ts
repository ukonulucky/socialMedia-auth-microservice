import express from "express"

import { authMiddleware } from "../middleware/authMiddleware"
import { createPaymentIntent, stripeWebhookController } from "../controllers/paymentController"

const paymentRouter = express.Router()

/* paymentRouter.use(authMiddleware) */
// this middleware will ensure users are authenticated

paymentRouter.post("/webhook", express.raw({ type: 'application/json' }), stripeWebhookController)

paymentRouter.post("/paymentIntent",createPaymentIntent)

 

export default paymentRouter