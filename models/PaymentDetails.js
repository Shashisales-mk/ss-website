const mongoose = require('mongoose');

const PaymentDetailsSchema = new mongoose.Schema({
  merchantTransactionId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'completed', 'failed'],
    default: 'initiated'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PaymentDetails = mongoose.model('PaymentDetails', PaymentDetailsSchema);

module.exports = PaymentDetails;