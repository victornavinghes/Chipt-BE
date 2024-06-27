const express = require("express");
const router = express.Router();

// Stripe webhook route
const StripeWebhookRoute = require("./stripe/StripeWebhookRoute.js");

// Admin Routes Import
const AdminAuthRoute = require("./Admin/authenticationRoute.js");
const AdminVendorRoute = require("./Admin/vendorRoute.js");
const AdminCustomerRoute = require("./Admin/customerRoute.js");
const AdminCupInventoryRoute = require("./Admin/cupInventoryRoute.js");
const AdminPackageRoute = require("./Admin/packageRoute.js");

// Vendors Routes Import
const VendorAuthRoute = require("./Vendors/authenticationRoute.js");
const VendorStockRoute = require("./Vendors/storeRoute.js");
const VendorCustomerRoute = require("./Vendors/customerRoute.js");
const VendorCupsRoute = require("./Vendors/cupRoute.js");
const VendorReturnCup = require("./Vendors/cupReturnRoute.js");
// Customers Routes Import
const CustomerAuthRoute = require("./Customers/authenticationRoute.js");
const CustomerVendorRoute = require("./Customers/vendorsRoute.js");
const CustomerOrderRoute = require("./Customers/orderRoutes.js");
const CustomerWalletRoute = require("./Customers/customerWalletRoute.js");
const CustomerPackageRoute = require("./Customers/customerPackageRoute.js");

// * Stripe webhook
router.use("/stripe/webhook", StripeWebhookRoute);

router.use(express.json({ limit: "50mb" }));
// A) Admin Route Table
router.use("/admin/account", AdminAuthRoute);
router.use("/admin/vendor", AdminVendorRoute);
router.use("/admin/cup", AdminCupInventoryRoute);
router.use("/admin/customer", AdminCustomerRoute);
router.use("/admin/package", AdminPackageRoute);

// B) Vendors Route Table
router.use("/vendor/account", VendorAuthRoute);
router.use("/vendor/store", VendorStockRoute);
router.use("/vendor/cup", VendorCupsRoute);
router.use("/vendor/customer", VendorCustomerRoute);
router.use("/vendor/return", VendorReturnCup);

// C) Customers Route Table
router.use("/customer/account", CustomerAuthRoute);
router.use("/customer/vendor", CustomerVendorRoute);
router.use("/customer/order", CustomerOrderRoute);
router.use("/customer/wallet", CustomerWalletRoute);
router.use("/customer/package", CustomerPackageRoute);

module.exports = router;
