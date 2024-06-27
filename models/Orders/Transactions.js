const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer'
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendors'
        },
        tokenID: {
            type: String
        },
        txnStatus: {
            type: String,
            enum: ['pending', 'success', 'fail']
        },
        orderAmount: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
        },
        timeOftxn: {
            type: Date
        },
        cupUniqueId: {
            type: String,
            required: true,
        },
        cupModelUniqueId: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
)

const Transactions = mongoose.model('Transactions', TransactionSchema);

module.exports = Transactions;