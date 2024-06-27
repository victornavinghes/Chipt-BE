const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken')

const AdminAuthSchema = new mongoose.Schema(
    {
        // <<<<<<<<<<<< Verifications >>>>>>>>>>>>
        accountActive: {
            type: Boolean,
            default: false,
            select: false
        },
        accountVerified: {
            type: Boolean,
            default: false,
            select: false
        },
        contactVerified: {
            type: Boolean,
            default: false,
            select: false
        },
        emailVerified: {
            type: Boolean,
            default: false,
            select: false
        },

        // <<<<<<<<<<<< Authentication >>>>>>>>>>>>
        username: {
            type: String,
            required: true,
        },
        primaryEmail: {
            type: String,
            required: true,
        },
        secondaryEmail: {
            type: String,
            select: false
        },
        countryCode: {
            type: Number,
            default: 91,
            select: false
        },
        primaryContactNumber: {
            type: Number,
            minLength: 10,
            maxLength: 10,
        },
        secondaryContactNumber: {
            type: Number,
            minLength: 10,
            maxLength: 10,
            select: false
        },


        // <<<<<<<<<<<< Profile Data >>>>>>>>>>>>
        name: {
            type: String,
            require: true,
            select: false
        },
        gender: {
            type: String,
            require: true,
            enum: ['male', 'female', 'others'],
            select: false
        },
        dateOfBirth: {
            type: Date,
            require: true,
            select: false
        },
        plotnumber: {
            type: String,
            select: false
        },
        address: {
            type: String,
            select: false
        },
        city: {
            type: String,
            require: true,
            select: false
        },
        state: {
            type: String,
            require: true,
            select: false
        },
        country: {
            type: String,
            select: false
        },
        zipCode: {
            type: Number,
            select: false
        },
        profilePicture: {
            public_id: {
                type: String,
                default: "default/user_jvowub"
            },
            url: {
                type: String,
                default: "https://res.cloudinary.com/dl0p1krhq/image/upload/v1706509827/default/user_jvowub.png"
            }
        },
        location: {
            type: String,
            enum: ['Point'],
            coodinates: {
                type: [ Number ],
            }
        },

        // <<<<<<<<<<<< Roles and Permissions >>>>>>>>>>>>
        primaryRole: {
            type: String,
            default: 'super_vendor',
            select: false
        },
        secondaryRole: {
            type: String,
            default: 'admin',
            select: false,
        },
        roleName: {
            type: String,
            default: 'NA',
            select: false
        },
        primaryPermissions: {
            type: Array,
            default: ['all'],
            select: false
        },

        // <<<<<<<<<<<< Password >>>>>>>>>>>>
        password: {
            type: String,
            minLength: 8,
            select: false
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
                default: true
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
                default: true
            },
        },
        oneTimeRegistrationPassword: {
            type: String,
            minLength: 8,
            select: false
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    { timestamps: true }
)

AdminAuthSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
});

AdminAuthSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
};

AdminAuthSchema.methods.getResetPasswordToken = async function () {
    // 1) generate token
    const resetToken = crypto.randomBytes(20).toString("hex");
    // 2) generate hash token and add to db
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 960000;
    return resetToken;
}

const Admin = mongoose.model('Admin', AdminAuthSchema);

module.exports = Admin;
