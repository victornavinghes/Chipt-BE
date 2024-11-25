const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        tnxID: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Transactions',
        },
        orderStatus: {
            type: String,
            default: 'pending',
            enum: ['pending', 'success', 'fail', 'failed']
        },
        orderTime: {
            type: Date,
            default: Date.now()
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Customer',
            required: true
        },
        fromVendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Vendors',
            required: true
        },

        returnedVendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Vendors',
            select: false
        },
        isReturned:{
            type: Boolean,
            default: false,
            select: false,
        },

        cupID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CupInventory'
        },
        cupModelUniqueId: {
            type: String
        },
        cupUniqueId: {
            type: String
        },

        orderAmount: {
            type: Number,
        },
        currency: {
            type: String
        },

        loyalityPoint: {
            type: Number
        },
        offers: [
            {
                type: String
            }
        ],
    },
    {
        timestamps: true,
    }
)

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;