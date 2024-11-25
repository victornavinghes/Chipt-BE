const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto');

const CustomerLoyalityPointSchame = new mongoose.Schema(
    {
            
    },
    { 
        timestamps: true 
    }
)

const CustomerLoyalityPoint = mongoose.model('CustomerLoyalityPoint', CustomerLoyalityPointSchame);

module.exports = CustomerLoyalityPoint
