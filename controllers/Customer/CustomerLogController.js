const catchAsync = require("../../errors/catchAsync");
const CustomerLogModel = require("../../models/Customer/LogModel");

exports.logInteraction = catchAsync(async (req, res, next) => {
  console.log("Starting logInteraction function");

  const { action } = req.body;
  console.log("Received action:", action);

  let payload = {
    timestamp: Date.now(),
    action,
  };
  console.log("Created payload:", payload);

  console.log("Creating new customer log entry");
  const customerLog = await CustomerLogModel.create(payload);
  console.log("Customer log entry created:", customerLog);

  console.log("Sending response");
  res.status(200).json({
    status: "success",
    data: customerLog,
  });

  console.log("logInteraction function completed successfully");
});
