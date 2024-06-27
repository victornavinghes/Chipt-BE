const express = require("express");
const router = express.Router();
const authToken = require("../../utils/authToken");
const {
  ActivateWalletController,
  GetWalletController,
} = require("../../controllers/Customer/customerwalletController");
const {
  GetSecurityDepositWithdrawl,
} = require("../../controllers/Customer/customerPackageController");

// Common middleware
const packageAuthMiddleware = [
  // authToken.isUserAuthenticated,
  // authToken.isUserAccountActive,
  // authToken.isUserAccountVerified,
  // authToken.userAuthorizedRole(["super_vendor", "admin"]),
  // authToken.userDataClear,
];

// 1. Add the package and get all packages
router.route("/activate").post(packageAuthMiddleware, ActivateWalletController);

router.route("/:customerId").get(packageAuthMiddleware, GetWalletController);
router
  .route("/withdraw")
  .post(packageAuthMiddleware, GetSecurityDepositWithdrawl);

module.exports = router;
