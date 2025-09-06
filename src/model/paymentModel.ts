import mongoose from 'mongoose';
import { paymentSchemaType } from "../types";
import { Schema } from "mongoose";

// Define the payment schema
const paymentSchema = new Schema<paymentSchemaType>({
  paymentIntentId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['created', 'succeeded', 'failed'],
    default: 'created',
  },
  userId: {
    type: String,
    required: true
  },
  groupId: String,
  transactionId: String,
  paymentIntentSecret: String,
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  chargeStatus: {
    type: String,
    enum: ['succeeded', 'failed', 'pending'],
  },
  paymentMethod: String,
  currency: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the Payment model
const PaymentModel = mongoose.model('Payment', paymentSchema);

export default PaymentModel;
