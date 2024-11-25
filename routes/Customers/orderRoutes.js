const express = require("express");
const router = express.Router();
const authToken = require("../../utils/authToken.js");
const customerOrdersController = require("../../controllers/Customer/customerOrderController.js");
const utilsCupsController = require("../../controllers/utilController/utilsCupController.js");
const logOrderController = require("../../controllers/Customer/CustomerLogController.js");

/*
    Index:
        01) Cup Details after Scan 
        01) Coffee cup order preview endpoint
        02) New transactions
        03) New coffee order
        04) All Orders
        05) All transactions
        06) All orders from a vendor
        07) All payments to a vendor
        08) Single order details
        09) Single transaction details
        10) All ordered cup details
        11) Ordered coffee cup information
        12) Fetching nearby vendor stores
        13) Returnable cup list
*/

// 01) CUSTOMER: Cup Details after Scan
router
  .route("/scanned/cup/details/:id")
  .put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_Scanned_Cup_Preview_Detail
  );

// 02) CUSTOMER: New transactions
router
  .route("/new/transaction")
  .post(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_New_Transaction
  );

// 03) CUSTOMER: New coffee order
router
  .route("/new/order")
  .post(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_New_Coffee_Order
  );

// For testing
// router.route("/new/order").post(
//   // authToken.isUserAuthenticated,
//   // authToken.isUserAccountActive,
//   // authToken.isUserAccountVerified,
//   // authToken.userAuthorizedRole(['customer', 'customer']),
//   // authToken.userDataClear,
//   customerOrdersController.projectName_Customer_New_Coffee_Order
// );

router.route("/add/logs").post(logOrderController.logInteraction);

// 04) CUSTOMER: All Orders
router
  .route("/all")
  .get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_All_Coffee_Orders
  );

// 05) CUSTOMER: All transactions
router
  .route("/all/transactions")
  .get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_All_Transactions_Made
  );

// 06) CUSTOMER: All orders from a vendor
router
  .route("/:vid/all")
  .get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_All_Orders_From_A_Vendor
  );

// 07) All payments to a vendor
router
  .route("/:vid/all/transactions")
  .get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_All_Payments_To_A_Vendor
  );

// 08) Single order details
router
  .route("/details/:id")
  .get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_Single_Coffee_Orders_details
  );

// 09) Single transaction details
router
  .route("/transaction/:id")
  .get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_Single_Transaction_Details
  );

// 10) All ordered cup details
router
  .route("/all/cups")
  .get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_All_Cup_Ordered_List
  );

// 11) Ordered coffee cup information
router
  .route("/single/cup/details/:cid")
  .get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_Ordered_Single_Cup_Information
  );

// 12) Fetching nearby vendor stores
router
  .route("/nearby/stores")
  .get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_Nearby_Vendor_Store
  );

// 13) Returnable cup list
router
  .route("/returanble/cup/list")
  .get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_Returnable_Cup_To_Vendor_List
  );

// 14) Return condition check
router
  .route("/return/cup/check")
  .put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_Returning_Cup_Status_Checking
  );

// 15) Return cup detagging
router
  .route("/retutn/vednor/cup")
  .put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_DeTagging_Tagging_Information_Of_Cup
  );

// 15) Return cup detagging
router
  .route("/fetching/returnable/cups")
  .get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerOrdersController.projectName_Customer_Fetching_Returnable_Cups
  );

module.exports = router;
