const mongoose = require('mongoose');

const CupInventorySchema = new mongoose.Schema(
    {
        cupModelUniqueId: {
            type: String,
            required: true
        },
        cupSize: {
            type: String,
            required: true,
        },
        cupType: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        cupCapacity: {
            type: Number,
            default: 0
        },
        cupPrice: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'RM'
        },
        cupImages: [
            {
                public_id: {
                    type: String,
                    default: "default/vendor_chlvnz"
                },
                url: {
                    type: String,
                    default: "https://res.cloudinary.com/dl0p1krhq/image/upload/v1706510864/default/vendor_chlvnz.jpg"
                }
            }
        ],
        cupsAvailable: {
            type: Number,
            default: 0,
            select: false
        },
        numberOfCups: {
            type: Number,
            default: 0
        },
        isCupAvailable: {
            type: Boolean,
            default: false
        },
        loyaltyPoints: {
            type: Number,
            default: 0
        },
        returnTime: {
            type: Number,
            default: 30,
            select: false
        }
    },
    { timestamps: true }
)

const CupInventory = mongoose.model('CupInventory', CupInventorySchema);

module.exports = CupInventory;