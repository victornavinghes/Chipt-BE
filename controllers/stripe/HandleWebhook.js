const stripe_secret_key = process.env.STRIPE_SECRET_KEY;
const stripe_webhook_key = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = require("stripe")(stripe_secret_key);
const CustomerWallet = require("../../models/Customer/CustomerWallet");
const StripeTransaction = require("../../models/Orders/StripeTransactions");
const ErrorHandler = require("../../utils/errorHandler");

const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      stripe_webhook_key
    );

    if (event.type === "charge.updated") {
      const session = event.data.object;
      const customerId = session.metadata.customerId;
      const paymentIntentId = session.payment_intent;
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      const amount = paymentIntent.amount;
      const currency = paymentIntent.currency;
      const status = paymentIntent.status;

      if (!amount || !currency || !status) {
        console.log("Amount, currency, or status not present in paymentIntent");
        return res.status(400).send("Invalid payment intent data");
      }

      if (!customerId || !paymentIntentId) {
        console.log("customerId or paymentIntentId not present in session");
        return res.status(400).send("Invalid session data");
      }

      try {
        await StripeTransaction.create({
          transaction_type: "package_buying",
          customer_id: customerId,
          amount: amount,
          currency: currency,
          status: status,
          stripe_payment_intent_id: paymentIntentId,
          package_id: session.metadata.packageId,
        });
      } catch (err) {
        console.error("Error creating StripeTransaction:", err);
        throw new ErrorHandler(
          `Failed to create StripeTransaction: ${err.message}`,
          500
        );
      }

      if (session.metadata.totalCredits && session.metadata.freeCupCredits) {
        let wallet = await CustomerWallet.findOne({ customer: customerId });
        if (!wallet) {
          wallet = new CustomerWallet({ customer: customerId });
        }

        // console.log("Initaial wallet.cupCredits", wallet.cupCredits);
        // console.log(
        //   "session.metadata.totalCredits",
        //   session.metadata.totalCredits
        // );
        // console.log(
        //   "session.metadata.freeCupCredits",
        //   session.metadata.freeCupCredits
        // );

        const totalFreeAndPaidCreidut =
          parseInt(session.metadata.totalCredits) +
          parseInt(session.metadata.freeCupCredits);
        wallet.cupCredits += totalFreeAndPaidCreidut;

        // console.log("After wallet.cupCredits", wallet.cupCredits);

        if (wallet.securityDeposit === 0) {
          wallet.securityDeposit = 15;
        }
        wallet.activatedOnce = true;
        wallet.isWalletActive = true;
        wallet.securityDepositPaymentIntentId = paymentIntentId;
        await wallet.save();
      }

      // Comment PackageOrder
      /*
      await PackageOrder.create({
        customerId,
        packageId,
        stripePriceId: session.metadata.priceId,
        transactionId,
      });
      */
    }
    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports = { handleWebhook };
