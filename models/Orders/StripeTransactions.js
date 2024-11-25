const mongoose = require("mongoose");

const stripeTransactionSchema = new mongoose.Schema(
  {
    transaction_type: {
      type: String,
      enum: ["activation", "package_buying"],
      required: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["succeeded", "pending", "failed"],
      required: true,
    },
    stripe_payment_intent_id: {
      type: String,
    },
    // If package type
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
  },

  {
    timestamps: true,
  }
);

const StripeTransaction = mongoose.model(
  "StripeTransaction",
  stripeTransactionSchema
);

module.exports = StripeTransaction;
