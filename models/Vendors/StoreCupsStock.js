const mongoose = require('mongoose');

const StoreCupsStockModel = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendors',
            required: true
        },
        primaryEmail: {
            type: String,
            required: true
        },
        cups: [
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
        ]
    },
    { timestamps: true }
)

const StoreCupsStock = mongoose.model('StoreCupsStock', StoreCupsStockModel);

module.exports = StoreCupsStock;