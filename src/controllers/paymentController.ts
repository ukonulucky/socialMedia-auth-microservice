
import Stripe from "stripe"
import { v4 as uuidv4 } from 'uuid';
import {  RequestHandler } from "express"
import { CustomePaymentReq } from "../types";
import { createPaymentIntentValidation } from "../utils/validate";
import logger from "../utils/logger";
import PaymentModel from "../model/paymentModel";
// Create PaymentIntent

const stripe = new Stripe(process.env.STRIP_SECRETE_KEY as string);

export const createPaymentIntent:RequestHandler = async (req, res) => {
  
  const { error } = createPaymentIntentValidation(req.body);
  console.log("request body",req.body)
  if (error) {
      console.log("paymentIntent body", req.body)
      logger.error("payment request body error", error.details[0].message);
      res.status(400).json({
        message: error.details[0].message,
        status: false,
      });
      return;
    }
  const { amount, email, name, groupId, userId } = req.body as CustomePaymentReq

 
    // create aunique key so user will not be charged twice
    const idempotencyKey = uuidv4()
  try {

    // create a customer
    const customer: Stripe.Customer = await stripe.customers.create({
      name,
      email,
      
  }, {idempotencyKey});

 const ephemeralKey = await stripe.ephemeralKeys.create(
  { customer: customer.id }, // Associate it with the customer
  { apiVersion: '2020-08-27' } // Specify the API version
 );
    


 const paymentIntent =   await stripe.paymentIntents.create({
  amount: amount * 100,// converting from pounds to penny as user is charge by the lowest currency unit
  currency: "gbp",
  receipt_email: email,
  description: `Payment for group ${groupId} by member ${userId}`,
  customer: customer.id
})
    console.log("paymentIntent", {  paymentIntentSecret: paymentIntent.client_secret,
      ephemeralKeySecret: ephemeralKey.secret,
      customerId: customer.id,
      publishableKey: process.env.STRIP_PUBLIC_KEY
    })
    
    res.status(200).json({
      paymentIntentSecret: paymentIntent.client_secret,
      ephemeralKeySecret: ephemeralKey.secret,
      customerId: customer.id,
      publishableKey: process.env.STRIP_PUBLIC_KEY
     })

   
  } catch (err) {
    console.error('Error creating payment intent:', error);
    logger.error(err)
      if (err instanceof Error) {
        logger.error(err.message)
          res.status(500).json({ 
              message: err.message,
              status: false
        });
      
      } else {
        res.status(500).json({ 
            message: "Error creating payment intent",
            status: false
      });
      }
  }
};

// Get Payment History of a User
export const getPaymentHistory:RequestHandler = async (req, res) => {
  const { userId } = req.params;

  try {
    const payments = await PaymentModel.find({ userId }); // Assuming userId is stored in payments
    res.status(200).json(payments);
  } catch (err) {
    console.error('Error fetching payment history:', err);
    logger.error(err)
      if (err instanceof Error) {
        logger.error(err.message)
          res.status(500).json({ 
              message: err.message,
              status: false
        });
      
      } else {
        res.status(500).json({ 
            message: "Error fetching payment history",
            status: false
      });
      }
  }
};

// Stripe Webhook to listen for payment success
export const stripeWebhookController:RequestHandler = async (req, res) => {


//charge.updated
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIP_WEBHOOK_ENDPOINT_SECRET as string);
   /*  console.log("webhook event", event) */

     // Handle the event types you are interested in
     switch (event.type) {
      case 'customer.created':
        const customerCreated = event.data.object;
        const userId = customerCreated.id; // You can store this userId or link it to your app's user
        const userEmail = customerCreated.email;
        const userName = customerCreated.name;
        
        // Create a new payment document with userId and other details
        await PaymentModel.updateOne(
          { userId },
          {
            $set: {
              userId, 
              email: userEmail,
              name: userName
            },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true }
        );
        console.log('Customer created:', customerCreated.id);
        break;

      case 'payment_intent.created':
        const paymentIntentCreated = event.data.object;
        await PaymentModel.updateOne(
          { paymentIntentId: paymentIntentCreated.id },
          {
            $set: {
              paymentIntentId: paymentIntentCreated.id,
              amount: paymentIntentCreated.amount,
              status: 'created',
              paymentIntentSecret: paymentIntentCreated.client_secret,
              currency: paymentIntentCreated.currency,
            },
            $setOnInsert: { createdAt: new Date() }, // Only set on insert
          },
          { upsert: true }  // Insert if not found
        );
        console.log('PaymentIntent created:', paymentIntentCreated.id);
        break;

      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object;
       
        console.log('PaymentIntent succeeded:', paymentIntentSucceeded);
        break;

      case 'charge.updated':
        const chargeUpdated = event.data.object;
        await PaymentModel.updateOne(
          { transactionId: chargeUpdated.id },
          {
            $set: {
              chargeStatus: chargeUpdated.status,
            },
          }
        );
        console.log('Charge updated:', chargeUpdated.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Acknowledge receipt of the event
    res.json({ received: true });

  } catch (err) {
    console.error('Error from webhook',err);
    logger.error(err)
      if (err instanceof Error) {
        logger.error(err.message)
          res.status(500).json({ 
              message: err.message,
              status: false
        });
      
      } else {
        res.status(500).json({ 
            message: "Webhook Error:",
            status: false
      });
      }
  
  }

 
 /*  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // Update the payment status in DB
  

    console.log('PaymentIntent was successful:', paymentIntent.id);
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;

    // Update the payment status in DB
    await Payment.updateOne(
      { paymentIntentId: paymentIntent.id },
      { status: 'failed' }
    );

    console.log('PaymentIntent failed:', paymentIntent.id);
  } */

  // Acknowledge receipt of the event
  res.json({ received: true });
};
