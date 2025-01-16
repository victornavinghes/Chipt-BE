const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const CustomerAuthSchema = new mongoose.Schema(
  {
    // Verifications
    isBlocked: {
      type: Boolean,
      default: false,
      select: false,
    },
    accountActive: {
      type: Boolean,
      default: false,
      select: false,
    },
    accountVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
    contactVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
    // User Authentication
    username: {
      type: String,
      // required: true,
    },
    name: {
      type: String,
      required: true,
    },
    primaryEmail: {
      type: String,
    },
    secondaryEmail: {
      type: String,
      select: false,
    },
    countryCode: {
      type: Number,
      default: 91,
    },
    primaryContactNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    secondaryContactNumber: {
      type: Number,
      minLength: 10,
      maxLength: 10,
      select: false,
    },

    // <<<<<<<<<<<< User Data >>>>>>>>>>>>
    firstname: {
      type: String,
      select: false,
    },
    middlename: {
      type: String,
      select: false,
    },
    lastname: {
      type: String,
      select: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "others"],
      select: false,
    },
    dateOfBirth: {
      type: Date,
      select: false,
    },
    profilePicture: {
      public_id: {
        type: String,
        default: "default/user_jvowub",
      },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dl0p1krhq/image/upload/v1706509827/default/user_jvowub.png",
      },
    },
    plotnumber: {
      type: String,
      select: false,
    },
    address: {
      type: String,
      select: false,
    },
    city: {
      type: String,
      select: false,
    },
    state: {
      type: String,
      select: false,
    },
    country: {
      type: String,
      select: false,
    },
    zipCode: {
      type: Number,
      select: false,
    },
    location: {
      type: String,
      enum: ["Point"],
      coodinates: {
        type: [Number],
      },
    },

    // Passwords
    password: {
      type: String,
      minLength: 8,
      select: false,
    },

    userOTP: {
      otp: {
        type: Number,
        minLength: 6,
        maxLength: 6,
      },
      timeToExpire: {
        type: Date,
      },
      OTPVerifed: {
        type: Boolean,
        default: false,
      },
    },
    forgotOTP: {
      otp: {
        type: Number,
        minLength: 6,
        maxLength: 6,
      },
      timeToExpire: {
        type: Date,
      },
      OTPVerifed: {
        type: Boolean,
        default: false,
      },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // <<<<<<<<<<<< Roles and Permissions >>>>>>>>>>>>
    primaryRole: {
      type: String,
      default: "customer",
      select: false,
    },
    secondaryRole: {
      type: String,
      default: "customer",
      select: false,
    },
    roleName: {
      type: String,
      default: "NA",
      select: false,
    },
    primaryPermissions: {
      type: Array,
      default: ["all"],
      select: false,
    },
    termAndCondition: {
      type: Boolean,
      default: true,
      select: false,
    },
    usedCoupons: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

CustomerAuthSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

CustomerAuthSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

CustomerAuthSchema.methods.getResetPasswordToken = async function () {
  // 1) generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  // 2) generate hash token and add to db
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 960000;
  return resetToken;
};

const Customer = mongoose.model("Customer", CustomerAuthSchema);

module.exports = Customer;
