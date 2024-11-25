const mongoose = require("mongoose");

const CustomerWalletSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    unique: true,
  },
  cupCredits: {
    type: Number,
    default: 0,
  },
  securityDeposit: {
    type: Number,
    default: 0,
  },
  activatedOnce: {
    type: Boolean,
    default: false,
  },
  isWalletActive: {
    type: Boolean,
    default: false,
  },
  securityDepositPaymentIntentId: {
    type: String,
  },
});

const CustomerWallet = mongoose.model("CustomerWallet", CustomerWalletSchema);

module.exports = CustomerWallet;
