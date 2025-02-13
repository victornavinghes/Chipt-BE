const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const VendorAuthSchema = new mongoose.Schema(
  {
    // <<<<<<<<<<<< Verifications >>>>>>>>>>>>
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

    // <<<<<<<<<<<< Authentication >>>>>>>>>>>>
    registrationID: {
      type: String,
      unique: true,
      select: false,
    },
    username: {
      type: String,
    },
    primaryEmail: {
      type: String,
      required: true,
    },
    secondaryEmail: {
      type: String,
      select: false,
    },
    countryCode: {
      type: Number,
      default: 91,
      select: false,
    },
    primaryContactNumber: {
      type: Number,
      minLength: 10,
      maxLength: 10,
      select: false,
    },
    secondaryContactNumber: {
      type: Number,
      minLength: 10,
      maxLength: 10,
      select: false,
    },

    // <<<<<<<<<<<< Profile Data >>>>>>>>>>>>
    name: {
      type: String,
    },
    singleUseCupCost: {
      type: Number,
    },
    dateOfRegistration: {
      type: Date,
      select: false,
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
      require: true,
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
    storeImages: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
    location: {
      type: { type: String },
      coordinates: [Number],
    },

    // <<<<<<<<<<<< Roles and Permissions >>>>>>>>>>>>
    primaryRole: {
      type: String,
      default: "vendor",
      select: false,
    },
    secondaryRole: {
      type: String,
      default: "employee",
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

    // <<<<<<<<<<<< Password >>>>>>>>>>>>
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
    oneTimePassword: {
      type: String,
      minLength: 8,
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // <<<<<<<<<<<< Password >>>>>>>>>>>>
    cupStockRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StoreCupsStock",
        select: false,
      },
    ],
    storeCupsStock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreCupsStock",
      select: false,
    },
  },
  { timestamps: true }
);

// Add a 2dsphere index on the location field
VendorAuthSchema.index({ location: "2dsphere" });

VendorAuthSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

VendorAuthSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

VendorAuthSchema.methods.getResetPasswordToken = async function () {
  // 1) generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  // 2) generate hash token and add to db
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

const Vendors = mongoose.model("Vendors", VendorAuthSchema);

module.exports = Vendors;
