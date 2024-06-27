const express = require("express");
const router = express.Router();
const { handleWebhook } = require("../../controllers/stripe/HandleWebhook");

// Stripe webhook route
router.post("/", express.raw({ type: "application/json" }), handleWebhook);

module.exports = router;
