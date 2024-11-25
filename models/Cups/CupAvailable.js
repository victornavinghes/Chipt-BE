const mongoose = require('mongoose');

const CupAvailableSchema = new mongoose.Schema(
    {
        modelID: {
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
        }
    },
    { timestamps: true }
)

const CupAvailable = mongoose.model('CupAvailable', CupAvailableSchema);

module.exports = CupAvailable;