const catchAsync = require("../../errors/catchAsync");
const Cup = require("../../models/Cups/Cup");
const Customer = require("../../models/Customer/Customer");
const CustomerWallet = require("../../models/Customer/CustomerWallet");
const Order = require("../../models/Orders/Order");
const Package = require("../../models/Package/Package");
const ErrorHandler = require("../../utils/errorHandler");
const stripe_secret_key = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(stripe_secret_key);

const { createPackageCheckoutSession } = require("../stripe/Stripe.package");
const { refundSecurityDeposit } = require("../stripe/stripe.securitydeposit");

const GetAllPackagesController = catchAsync(async (req, res, next) => {
  const customerId = req.user.id;
  const wallet = await CustomerWallet.findOne({ customer: customerId });
  const membership =
    wallet && wallet.isWalletActive && wallet.securityDeposit >= 15;
  const packages = await Package.find({ isActive: true });
  res.status(200).json({
    success: true,
    data: packages,
    membership: membership,
  });
});

const CreatePaymentIntentController = catchAsync(async (req, res, next) => {
  const { packageId, customerId } = req.body;
  const package = await Package.findOne({ _id: packageId, isActive: true });
  const customer = await Customer.findById(customerId);

  if (!package) {
    return next(
      new ErrorHandler(`Package not found with id ${packageId}`, 404)
    );
  }

  if (!package.price) {
    return next(new ErrorHandler(`Price not found for package`, 404));
  }

  if (!customer) {
    return next(
      new ErrorHandler(`Customer not found with id ${customerId}`, 404)
    );
  }

  let orderAmount = Math.round(package.price * 100);

  const wallet = await CustomerWallet.findOne({ customer: customer._id });

  if (!wallet || wallet.securityDeposit < 15) {
    orderAmount += 1500;
  }

  if (orderAmount < 200) {
    return next(new ErrorHandler(`Order amount must be at least 200 sen`, 400));
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "myr",
      amount: orderAmount,
      automatic_payment_methods: { enabled: true },
      metadata: {
        packageId: packageId,
        customerId: customerId,
        totalCredits: package.totalCredits,
        freeCupCredits: package.freeCupCredits,
      },
    });

    res.send({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

// const BuyPackageController = catchAsync(async (req, res, next) => {
//   const { packageId, customerId } = req.body;
//   const package = await Package.findById(packageId);
//   const customer = await Customer.findById(customerId);

//   if (!package) {
//     return next(
//       new ErrorHandler(`Package not found with id ${packageId}`, 404)
//     );
//   }

//   if (!package.stripePriceId) {
//     return next(new ErrorHandler(`Stripe price ID not found for package`, 404));
//   }

//   if (!customer) {
//     return next(
//       new ErrorHandler(`Customer not found with id ${customerId}`, 404)
//     );
//   }

//   const stripePriceId = package.stripePriceId;
//   const session = await createPackageCheckoutSession(
//     stripePriceId,
//     customerId,
//     packageId
//   );

//   //   res.redirect(303, session.url); In production
//   res.json({ url: session.url });
// });

// Without comments
// const GetSecurityDepositWithdrawl = catchAsync(async (req, res, next) => {
//   try {
//     const { customerId } = req.body;
//     const customer = await Customer.findById(customerId);
//     if (!customer) {
//       return next(
//         new ErrorHandler(`Customer not found with id ${customerId}`, 404)
//       );
//     }

//     const wallet = await CustomerWallet.findOne({ customer: customer._id });
//     if (!wallet || wallet.securityDeposit <= 0) {
//       return next(new ErrorHandler(`No security deposit for withdrawl`, 404));
//     }

//     // const activeLease = await Cup.findOne({
//     //   currentCustomer: customer._id,
//     //   $or: [
//     //     { "cupBoughtHistory.returnDate": null },
//     //     { "cupBoughtHistory.returnDate": { $exists: false } },
//     //   ],
//     // });

//     const activeLease = await Order.findOne({
//       customer: customer._id,
//       orderStatus: "success",
//       isReturned: false,
//     });

//     if (activeLease) {
//       return next(
//         new ErrorHandler(
//           "Cannot refund security deposit while you have active cup leases",
//           400
//         )
//       );
//     }

//     const securityDepositAmount = wallet.securityDeposit;
//     const paymentIntentId = wallet.securityDepositPaymentIntentId;
//     const refund = await refundSecurityDeposit(
//       customerId,
//       paymentIntentId,
//       securityDepositAmount
//     );
//     if (refund) {
//       await CustomerWallet.findOneAndUpdate(
//         { customer: customer._id },
//         {
//           securityDeposit: 0,
//           securityDepositPaymentIntentId: "",
//           isWalletActive: false,
//         }
//       );
//       res.status(200).json({ success: true, message: "Refund successful" });
//     } else {
//       return next(new ErrorHandler("Failed to initiate refund", 500));
//     }
//   } catch (error) {
//     console.error("Error refunding security deposit:", error);
//     return next(new ErrorHandler(error.message, 500));
//   }
// });

// With comments
const GetSecurityDepositWithdrawl = catchAsync(async (req, res, next) => {
  try {
    // Extract customer ID from request body
    const { customerId } = req.body;

    // Find the customer by ID
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return next(
        new ErrorHandler(`Customer not found with id ${customerId}`, 404)
      );
    }

    // Find the customer's wallet
    const wallet = await CustomerWallet.findOne({ customer: customer._id });
    if (!wallet || wallet.securityDeposit <= 0) {
      return next(new ErrorHandler(`No security deposit for withdrawal`, 404));
    }

    // Check for active leases
    // Note: The commented out code below seems to be an alternative way to check for active leases
    /*
    const activeLease = await Cup.findOne({
      currentCustomer: customer._id,
      $or: [
        { "cupBoughtHistory.returnDate": null },
        { "cupBoughtHistory.returnDate": { $exists: false } },
      ],
    });
    */

    // Check for active orders (current method to check for active leases)
    const activeLease = await Order.findOne({
      customer: customer._id,
      orderStatus: "success",
      isReturned: false,
    });

    // If there's an active lease, prevent refund
    if (activeLease) {
      return next(
        new ErrorHandler(
          "Cannot refund security deposit while you have active cup leases",
          400
        )
      );
    }

    // Get security deposit amount and payment intent ID
    const securityDepositAmount = wallet.securityDeposit;
    const paymentIntentId = wallet.securityDepositPaymentIntentId;

    // Initiate refund process
    const refund = await refundSecurityDeposit(
      customerId,
      paymentIntentId,
      securityDepositAmount
    );

    if (refund) {
      // If refund is successful, update customer wallet
      await CustomerWallet.findOneAndUpdate(
        { customer: customer._id },
        {
          securityDeposit: 0,
          securityDepositPaymentIntentId: "",
          isWalletActive: false,
        }
      );
      // Send success response
      res.status(200).json({ success: true, message: "Refund successful" });
    } else {
      // If refund fails, throw an error
      return next(new ErrorHandler("Failed to initiate refund", 500));
    }
  } catch (error) {
    // Log any errors that occur during the process
    console.error("Error refunding security deposit:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});
module.exports = {
  GetAllPackagesController,
  // BuyPackageController,
  GetSecurityDepositWithdrawl,
  CreatePaymentIntentController,
};
