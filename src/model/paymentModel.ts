import { paymentSchemaType } from "../types";
import {Schema  } from "mongoose"

// models/payment.js
const mongoose = require('mongoose');

const paymentSchema = new Schema<paymentSchemaType>({
  paymentIntentId: String,
  amount: Number,
  status: {
    type: String,
    enum: ['created', 'succeeded', 'failed'],
    default: 'created',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  groupId: String,
  transactionId: String,
  paymentIntentSecret: String
});

const PaymentModel = mongoose.model('Payment', paymentSchema);
  export default PaymentModel