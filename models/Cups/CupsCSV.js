const mongoose = require('mongoose');

const CupsCSVSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        },
        cupIDsArray: {
            type: Array,
            default: [],
            required: true
        },
        generatedTime: {
            type: Date,
            default: Date.now()}
    },
    { timestamps: true }
)

const CupsCSV = mongoose.model('CupsCSV', CupsCSVSchema);

module.exports = CupsCSV;