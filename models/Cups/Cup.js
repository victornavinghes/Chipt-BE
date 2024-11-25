const mongoose = require('mongoose');

const CupsSchema = new mongoose.Schema(
    {
        cupID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CupInventory'
        },
        cupModelUniqueId: {
            type: String,
            required: true,
        },
        cupUniqueId: {
            type: String,
            required: true,
        },
        isOrderable: {
            type: Boolean,
            default: true
        },
        lastVendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendors'
        },
        currentVendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendors'
        },
        currentCustomer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer'
        },
        orderDate: {
            type: Date
        },
        cupBoughtHistory: [
            {
                customer: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Customer'
                },
                fromVendor: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Vendors'
                },
                order: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Order'
                },
                purchaseDate: {
                    type: Date
                },
                returnVendor: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Vendors'
                },
                returnDate: {
                    type: Date
                },
            }
        ],
        isActive: {
            type: Boolean,
            default: true,
            select: false
        }
    },
    {
        timestamps: true
    }
)

const Cup = mongoose.model('Cup', CupsSchema);

module.exports = Cup;