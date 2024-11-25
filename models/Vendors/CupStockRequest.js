const mongoose = require('mongoose');

const CupStockRequestSchema = new mongoose.Schema(
    {

        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendors',
        },
        dateOfRequest: {
            type: Date,
            required: true,
            default: Date.now()
        },
        cupsRequested: [
            {
                cupID: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'CupInventory'
                },
                numberOfCups: {
                    type: Number,
                    default: 0
                }
            }
        ],
        shippingAddress: {
            plotnumber: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true
            },
            zipCode: {
                type: Number,
                required: true
            },
        },
        countryCode: {
            type: Number,
            default: 91,
            required: true
        },
        contactNumber: {
            type: Number,
            maxLength: 10,
            minLength: 10,
            required: true,
            default: 0,
        },
        approvalStatus: {
            type: String,
            default: 'STATUS_PENDING',
            enum: ['STATUS_PENDING', 'STATUS_ACCEPTED', 'STATUS_REJECTED'],
        },
        requestStatus: {
            type: String,
            default: 'PROCESSING',
            enum: ['PROCESSING', 'DISPATCH', 'SHIPPED', 'DELIVERED', 'REJECTED'],
            select: false
        },
        isDeliveryConfirm:{
            type: Boolean,
            default: false,
            select: false
        }
    },
    { timestamps: true}
)

const CupStockRequest = mongoose.model('CupStockRequest', CupStockRequestSchema);

module.exports = CupStockRequest