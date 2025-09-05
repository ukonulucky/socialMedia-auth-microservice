
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
    if (error) {
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
      email
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
    

    // Save the payment data (without confirming it yet)
    const payment = new PaymentModel({
      paymentIntentId: paymentIntent.id,
      amount,
      status: 'created',
      userEmail: email,
      groupId,
      paymentIntentSecret: paymentIntent.client_secret,
    });

    await payment.save();
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
    console.error('Error fetching payment history:', error);
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
export const stripeWebhook:RequestHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event types you are interested in
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // Update the payment status in DB
    await PaymentModel.updateOne(
      { paymentIntentId: paymentIntent.id },
      { status: 'succeeded', transactionId: paymentIntent.charges.data[0].id }
    );

    console.log('PaymentIntent was successful:', paymentIntent.id);
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;

    // Update the payment status in DB
    await Payment.updateOne(
      { paymentIntentId: paymentIntent.id },
      { status: 'failed' }
    );

    console.log('PaymentIntent failed:', paymentIntent.id);
  }

  // Acknowledge receipt of the event
  res.json({ received: true });
};
