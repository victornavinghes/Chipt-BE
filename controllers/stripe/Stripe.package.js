const stripe_secret_key = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(stripe_secret_key);
const { v4: uuidv4 } = require("uuid");

async function createStripeProduct(name, description, price, currency = "myr") {
  try {
    const stripeProduct = await stripe.products.create({
      name,
      description,
    });
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: price * 100,
      currency: currency,
    });
    return {
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
    };
  } catch (error) {
    throw new Error(`Error creating Stripe product: ${error.message}`);
  }
}

async function updateStripeProduct(
  productId,
  name,
  description,
  price,
  currency = "mga"
) {
  try {
    const stripeProduct = await stripe.products.update(productId, {
      name,
      description,
    });

    const newPrice = await stripe.prices.create({
      product: productId,
      unit_amount: price,
      currency: currency,
    });

    return {
      stripeProductId: stripeProduct.id,
      stripePriceId: newPrice.id,
    };
  } catch (error) {
    throw new Error(`Error updating Stripe product: ${error.message}`);
  }
}

async function deleteStripeProduct(productId) {
  try {
    console.log(productId);
    await stripe.products.update(productId, { active: false });
    return {
      message: "Stripe product and associated prices deleted successfully",
    };
  } catch (error) {
    throw new Error(`Error deleting Stripe product: ${error.message}`);
  }
}

async function createPackageCheckoutSession(priceId, customerId, packageId) {
  const transactionId = uuidv4();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    client_reference_id: customerId,
    success_url: `${process.env.CUSTOMER_BASE_URL}/wallet`,
    cancel_url: `${process.env.CUSTOMER_BASE_URL}/cancel`,
    metadata: {
      type: "package",
      priceId: priceId,
      packageId,
      transactionId,
    },
  });

  return session;
}

module.exports = {
  createStripeProduct,
  updateStripeProduct,
  deleteStripeProduct,
  createPackageCheckoutSession,
};
