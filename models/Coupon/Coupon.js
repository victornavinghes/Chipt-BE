const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    validTill: {
      type: Date,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", CouponSchema);

module.exports = Coupon;
