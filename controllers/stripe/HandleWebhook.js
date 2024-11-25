const CustomerWallet = require("../../models/Customer/CustomerWallet");
const StripeTransaction = require("../../models/Orders/StripeTransactions");
const Package = require("../../models/Package/Package");
const PackageOrder = require("../../models/Package/PackageOrder");
const ErrorHandler = require("../../utils/errorHandler");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerId = session.client_reference_id;
      const checkoutSessionId = session.id;
      const isActivatingWallet =
        session.metadata && session.metadata.activationWallet === "true";
      const transactionId = session.metadata.transactionId;
      const paymentIntentId = session.payment_intent;
      const defaultCupCredits = session.metadata.defaultCupCredits;
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      console.log(paymentIntent);
      const amount = paymentIntent.amount;
      const currency = paymentIntent.currency;
      const status = paymentIntent.status;
      console.log("Stripe transactions create");
      try {
        await StripeTransaction.create({
          transaction_type: isActivatingWallet
            ? "activation"
            : "package_buying",
          customer_id: customerId,
          amount: amount,
          currency: currency,
          status: status,
          stripe_payment_intent_id: paymentIntentId,
          package_id: isActivatingWallet ? null : session.metadata.packageId,
        });
      } catch (err) {
        console.error("Error creating StripeTransaction:", err);
        throw new ErrorHandler(
          `Failed to create StripeTransaction: ${err.message}`,
          500
        );
      }

      console.log("Stripe transactions added");
      if (isActivatingWallet) {
        const updateFields = {
          isWalletActive: true,
          securityDeposit: session.metadata.securityDeposit,
          securityDepositPaymentIntentId: paymentIntentId,
          activatedOnce: true,
        };

        if (defaultCupCredits) {
          updateFields.cupCredits = defaultCupCredits;
        }

        await CustomerWallet.findOneAndUpdate(
          { customer: customerId },
          updateFields
        );
      }
      if (session.metadata.type === "package") {
        const priceId = session.metadata.priceId;
        const packageId = session.metadata.packageId;
        try {
          await updateCustomerWallet(customerId, priceId);

          await PackageOrder.create({
            customerId,
            packageId,
            stripePriceId: priceId,
            transactionId,
          });
        } catch (error) {
          return next(
            new ErrorHandler(`Failed to update wallet: ${error.message}`, 400)
          );
        }
      }
    }
    res.json({ received: true });
  } catch (err) {
    res.status(400).send("Webhook Error:", err.message);
  }
};

// Util function for webhook

async function updateCustomerWallet(customerId, priceId) {
  try {
    const package = await Package.findOne({ stripePriceId: priceId });

    if (!package) {
      throw new Error(`Package not found with priceId: ${priceId}`);
    }

    let wallet = await CustomerWallet.findOne({ customer: customerId });

    if (!wallet) {
      throw new Error(`Wallet not found for customer with id: ${customerId}`);
    }

    wallet.cupCredits += package.totalCredits;

    await wallet.save();
  } catch (err) {
    console.log(err);
  }
}

module.exports = { handleWebhook };

// stripe listen --forward-to localhost:5000/api/v1/stripe/webhook
