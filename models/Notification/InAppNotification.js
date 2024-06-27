const mongoose = require('mongoose');

const InAppNotificationSchema = new mongoose.Schema(
    {
        sentAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        sentVendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendors'
        },
        sentCustomer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer'
        },
        toAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        toVendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendors'
        },
        toCustomer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer'
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        messageRead: {
            type: Boolean,
            default: false,
            select: false
        }
    },
    { timestamps: true }
)

const InAppNotification = mongoose.model('InAppNotification', InAppNotificationSchema);

module.exports = InAppNotification;