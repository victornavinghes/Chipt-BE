const catchAsync = require("../../errors/catchAsync");
const CustomerWallet = require("../../models/Customer/CustomerWallet");
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

  const session = await createCheckoutSession(
    customerId,
    securityDepositAmount
  );
  //   res.redirect(303, session.url); In production
  res.json({ url: session.url });
});

const GetWalletController = catchAsync(async (req, res, next) => {
  const { customerId } = req.params;
  if (!customerId) {
    return next(new ErrorHandler(`Please provide the customer ID`, 400));
  }

  const wallet = await CustomerWallet.findOne({ customer: customerId }).lean();
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

module.exports = { ActivateWalletController, GetWalletController };
