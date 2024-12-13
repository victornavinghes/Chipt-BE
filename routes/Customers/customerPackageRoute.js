const express = require("express");
const router = express.Router();
const authToken = require("../../utils/authToken");
const {
  GetAllPackagesController,
  // BuyPackageController,
  CreatePaymentIntentController,
} = require("../../controllers/Customer/customerPackageController");

// Common middleware
const packageAuthMiddleware = [
  authToken.isUserAuthenticated,
  authToken.isUserAccountActive,
  // authToken.isUserAccountVerified,
  // authToken.userAuthorizedRole(["super_vendor", "admin"]),
  authToken.userDataClear,
];

router.route("/").get(packageAuthMiddleware, GetAllPackagesController);

// router.route("/buy").post(packageAuthMiddleware, BuyPackageController);

// Stripe
router
  .route("/create-payment-intent")
  .post(packageAuthMiddleware, CreatePaymentIntentController);

module.exports = router;
