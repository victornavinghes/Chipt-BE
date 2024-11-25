const catchAsync = require("../../errors/catchAsync");
const CustomerWallet = require("../../models/Customer/CustomerWallet");
const Order = require("../../models/Orders/Order");
const ErrorHandler = require("../../utils/errorHandler");
const { createCheckoutSession } = require("../stripe/stripe.securitydeposit");

const ActivateWalletController = catchAsync(async (req, res, next) => {
  const { customerId, securityDepositAmount } = req.body;
  if (!customerId || !securityDepositAmount) {
    return next(new ErrorHandler(`Please provide all required details`, 400));
  }

  const wallet = await CustomerWallet.findOne({ customer: customerId });
  console.log(wallet);
  if (!wallet) {
    await CustomerWallet.create({ customer: customerId });
  }

  const addDefaultCredits = !wallet?.activatedOnce;

  const session = await createCheckoutSession(
    customerId,
    securityDepositAmount,
    addDefaultCredits
  );
  //   res.redirect(303, session.url); In production
  res.json({ url: session.url });
});

const GetWalletController = catchAsync(async (req, res, next) => {
  const { customerId } = req.params;
  if (!customerId) {
    return next(new ErrorHandler(`Please provide the customer ID`, 400));
  }

  const wallet = await CustomerWallet.findOne({
    customer: customerId,
  }).lean();
  if (!wallet) {
    return next(
      new ErrorHandler(`Wallet not found for customer ID: ${customerId}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: wallet,
  });
});

const GetPackageOrderController = catchAsync(async (req, res, next) => {
  const customerId = req.user.id;
  if (!customerId) {
    console.error("Customer ID not provided");
    return next(new ErrorHandler("Invalid request", 400));
  }

  try {
    const packageOrders = await Order.find({ customer: customerId })
      .sort({
        orderTime: -1,
      })
      .populate("customer")
      .populate("fromVendor");
    if (!packageOrders.length) {
      console.warn(`No orders found for customer ID: ${customerId}`);
    }
    res.status(200).json({
      success: true,
      data: packageOrders,
    });
  } catch (error) {
    console.error(
      `Error fetching package orders for customer ID: ${customerId}`,
      error
    );
    return next(
      new ErrorHandler(`Error fetching package orders: ${error.message}`, 500)
    );
  }
});

module.exports = {
  ActivateWalletController,
  GetWalletController,
  GetPackageOrderController,
};
