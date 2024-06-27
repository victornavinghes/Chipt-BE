const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (customerId, securityDepositAmount) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mga",
            product_data: {
              name: "Security Deposit",
            },
            unit_amount: securityDepositAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CUSTOMER_BASE_URL}/wallet`,
      cancel_url: `${process.env.CUSTOMER_BASE_URL}/checkout-cancel`,
      client_reference_id: customerId,
      metadata: {
        activationWallet: true,
        securityDeposit: securityDepositAmount,
      },
    });

    return session;
  } catch (error) {
    throw new Error(`Error creating checkout session: ${error.message}`);
  }
};

const refundSecurityDeposit = async (customerId, paymentIntentId, amount) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const chargeId = paymentIntent.latest_charge;

    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount: amount,
    });

    console.log(`Refund created successfully: ${refund.id}`);
    return refund;
  } catch (error) {
    console.error("Error refunding security deposit:", error);
    throw error;
  }
};

module.exports = { createCheckoutSession, refundSecurityDeposit };
