const mongoose = require("mongoose");

const CustomerLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  action: String,
});

const CustomerLogModel = mongoose.model("CustomerLog", CustomerLogSchema);

module.exports = CustomerLogModel;
