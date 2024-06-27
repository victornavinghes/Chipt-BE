const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    numberOfCups: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    validity: {
      type: Number,
      required: true,
      default: 30,
    },
    freeCupCredits: {
      type: Number,
      default: 0,
    },
    totalCredits: {
      type: Number,
      required: true,
    },
    creditsPerCup: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stripeProductId: {
      type: String,
      required: true,
    },
    stripePriceId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Package = mongoose.model("Package", PackageSchema);

module.exports = Package;
