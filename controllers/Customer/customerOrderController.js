// BuiltIn Module Import
const crypto = require("crypto");
const mongoose = require("mongoose");

// Created middleware Import
const CatchAsync = require("../../errors/catchAsync.js");
const ErrorHandler = require("../../utils/errorHandler.js");

// Database Import
const Customers = require("../../models/Customer/Customer.js");
const Vendors = require("../../models/Vendors/Vendor.js");
const Transactions = require("../../models/Orders/Transactions.js");
const Cups = require("../../models/Cups/Cup.js");
const Order = require("../../models/Orders/Order.js");
const VendorStoreStock = require("../../models/Vendors/StoreCupsStock.js");
const CupInInvenorty = require("../../models/Cups/CupInventory.js");
const Cup = require("../../models/Cups/Cup.js");
const CupInventory = require("../../models/Cups/CupInventory.js");
const { isDataView } = require("util/types");
const CustomerWallet = require("../../models/Customer/CustomerWallet.js");
const StripeTransaction = require("../../models/Orders/StripeTransactions.js");

/*
    Index:
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
        11) Near by vendor store
        12) Returnable cup list
        13) All ordered cup details
        14) Checking cup return condition
*/

// 01) CUSTOMER: Coffee cup order preview endpoint
// exports.projectName_Customer_Scanned_Cup_Preview_Detail = CatchAsync(
//   async (req, res, next) => {
//     // Destructuring Data
//     const customerId = req.user.id;
//     const { uniqueID } = req.body;

//     // Fetching data
//     const isCupData = await Cup.findOne({
//       cupUniqueId: uniqueID.split(":").join("").toUpperCase(),
//     })
//       .populate(
//         "currentVendor",
//         "profilePicture name plotnumber address city state country zipCode"
//       )
//       .populate(
//         "currentCustomer",
//         "firstname, middlename lastname profilePicture"
//       )
//       .populate(
//         "cupID",
//         "cupModelUniqueId cupSize cupType cupCapacity cupPrice currency cupImages loyaltyPoints returnTime"
//       );

//     if (!isCupData) {
//       return next(new ErrorHandler("No cup data found", 404));
//     }

//     let returnObject = {
//       modelID: isCupData.cupID.cupModelUniqueId.toUpperCase(),
//       uniqueID: uniqueID.toUpperCase(),
//       cupSize:
//         isCupData.cupID.cupSize.charAt(0).toUpperCase() +
//         isCupData.cupID.cupSize.slice(1),
//       cupType:
//         isCupData.cupID.cupType.charAt(0).toUpperCase() +
//         isCupData.cupID.cupType.slice(1),
//       capacity: isCupData.cupID.cupCapacity,
//       price: isCupData.cupID.cupPrice,
//       currency: isCupData.cupID.currency.toUpperCase(),
//       cupImages: isCupData.cupID.cupImages,
//       returnDate: isCupData.cupID.returnTime,
//       point: isCupData.cupID.loyaltyPoints,
//       isReturn: true,
//       isOrderable: true,
//       vendor: null,
//       orderDate: null,
//     };

//     if (isCupData) {
//       if (isCupData.currentCustomer) {
//         let crntCust = isCupData.currentCustomer._id.toString();
//         let logUser = customerId.toString();
//         if (crntCust === logUser) {
//           returnObject.isReturn = false;
//           returnObject.orderDate = isCupData.orderDate;
//         }
//       } else if (!isCupData.currentCustomer && isCupData.isOrderable === true) {
//         returnObject.isReturn = true;
//       }
//       returnObject.isOrderable = isCupData.isOrderable;
//       returnObject.vendor = isCupData.currentVendor;
//       if (isCupData.isOrderable) {
//         returnObject.customer = isCupData.currentCustomer;
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: "Cup details",
//       cupData: returnObject,
//     });
//   }
// );

// with console.logs
exports.projectName_Customer_Scanned_Cup_Preview_Detail = CatchAsync(
  async (req, res, next) => {
    console.log("Customer Scanned Cup Preview Detail initiated");

    // Destructuring Data
    const customerId = req.user.id;
    const { uniqueID } = req.body;
    console.log("Request data:", { customerId, uniqueID });

    // Fetching data
    console.log("Fetching cup data for uniqueID:", uniqueID);
    const isCupData = await Cup.findOne({
      cupUniqueId: uniqueID.toUpperCase(),
    })
      .populate(
        "currentVendor",
        "profilePicture name plotnumber address city state country zipCode"
      )
      .populate(
        "currentCustomer",
        "firstname, middlename lastname profilePicture"
      )
      .populate(
        "cupID",
        "cupModelUniqueId cupSize cupType cupCapacity cupPrice currency cupImages loyaltyPoints returnTime"
      );

    if (!isCupData) {
      console.log("No cup data found for uniqueID:", uniqueID);
      return next(new ErrorHandler("No cup data found", 404));
    }

    console.log("Cup data found:", isCupData._id);

    let returnObject = {
      modelID: isCupData.cupID.cupModelUniqueId.toUpperCase(),
      uniqueID: uniqueID.toUpperCase(),
      cupSize:
        isCupData.cupID.cupSize.charAt(0).toUpperCase() +
        isCupData.cupID.cupSize.slice(1),
      cupType:
        isCupData.cupID.cupType.charAt(0).toUpperCase() +
        isCupData.cupID.cupType.slice(1),
      capacity: isCupData.cupID.cupCapacity,
      price: isCupData.cupID.cupPrice,
      currency: isCupData.cupID.currency.toUpperCase(),
      cupImages: isCupData.cupID.cupImages,
      returnDate: isCupData.cupID.returnTime,
      point: isCupData.cupID.loyaltyPoints,
      isReturn: true,
      isOrderable: true,
      vendor: null,
      orderDate: null,
    };

    console.log("Initial return object created");

    if (isCupData) {
      console.log("Processing cup data");
      if (isCupData.currentCustomer) {
        console.log("Cup has a current customer");
        let crntCust = isCupData.currentCustomer._id.toString();
        let logUser = customerId.toString();
        console.log("Comparing current customer and logged-in user:", {
          crntCust,
          logUser,
        });
        if (crntCust === logUser) {
          console.log("Cup belongs to logged-in user");
          returnObject.isReturn = false;
          returnObject.orderDate = isCupData.orderDate;
        }
      } else if (!isCupData.currentCustomer && isCupData.isOrderable === true) {
        console.log("Cup has no current customer and is orderable");
        returnObject.isReturn = true;
      }
      returnObject.isOrderable = isCupData.isOrderable;
      returnObject.vendor = isCupData.currentVendor;
      console.log("Cup orderability:", isCupData.isOrderable);
      if (isCupData.isOrderable) {
        returnObject.customer = isCupData.currentCustomer;
        console.log("Added current customer to return object");
      }
    }

    console.log("Final return object:", returnObject);

    res.status(200).json({
      success: true,
      message: "Cup details",
      cupData: returnObject,
    });

    console.log("Cup preview detail response sent");
  }
);

// Without console.logs
// exports.projectName_Customer_Scanned_Cup_Preview_Detail = CatchAsync(
//   async (req, res, next) => {
//     // Destructuring Data
//     const customerId = req.user.id;
//     const { uniqueID } = req.body;

//     // Fetching data
//     const isCupData = await Cup.findOne({
//       cupUniqueId: uniqueID.split(":").join("").toUpperCase(),
//     })
//       .populate(
//         "currentVendor",
//         "profilePicture name plotnumber address city state country zipCode"
//       )
//       .populate(
//         "currentCustomer",
//         "firstname, middlename lastname profilePicture"
//       )
//       .populate(
//         "cupID",
//         "cupModelUniqueId cupSize cupType cupCapacity cupPrice currency cupImages loyaltyPoints returnTime"
//       );

//     if (!isCupData) {
//       return next(new ErrorHandler("No cup data found", 404));
//     }

//     let returnObject = {
//       modelID: isCupData.cupID.cupModelUniqueId.toUpperCase(),
//       uniqueID: uniqueID.toUpperCase(),
//       cupSize:
//         isCupData.cupID.cupSize.charAt(0).toUpperCase() +
//         isCupData.cupID.cupSize.slice(1),
//       cupType:
//         isCupData.cupID.cupType.charAt(0).toUpperCase() +
//         isCupData.cupID.cupType.slice(1),
//       capacity: isCupData.cupID.cupCapacity,
//       price: isCupData.cupID.cupPrice,
//       currency: isCupData.cupID.currency.toUpperCase(),
//       cupImages: isCupData.cupID.cupImages,
//       returnDate: isCupData.cupID.returnTime,
//       point: isCupData.cupID.loyaltyPoints,
//       isReturn: true,
//       isOrderable: true,
//       vendor: null,
//       orderDate: null,
//     };

//     if (isCupData) {
//       if (isCupData.currentCustomer) {
//         let crntCust = isCupData.currentCustomer._id.toString();
//         let logUser = customerId.toString();
//         if (crntCust === logUser) {
//           returnObject.isReturn = false;
//           returnObject.orderDate = isCupData.orderDate;
//         }
//       } else if (!isCupData.currentCustomer && isCupData.isOrderable === true) {
//         returnObject.isReturn = true;
//       }
//       returnObject.isOrderable = isCupData.isOrderable;
//       returnObject.vendor = isCupData.currentVendor;
//       if (isCupData.isOrderable) {
//         returnObject.customer = isCupData.currentCustomer;
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: "Cup details",
//       cupData: returnObject,
//     });
//   }
// );

// 02) ✅ CUSTOMER: New coffee order
// exports.projectName_Customer_New_Coffee_Order = CatchAsync(
//   async (req, res, next) => {
//     // a) Destructuring data and checking for error
//     const { modelId, uniqueId, vendor, amount, currency } = req.body;
//     if (!modelId || !uniqueId || !vendor || !currency) {
//       return next(new ErrorHandler(`Please provide all details`, 400));
//     }
//     if (amount && typeof amount !== "number") {
//       return next(new ErrorHandler(`Please provide all details`, 400));
//     }

//     // Stub
//     // req = {
//     //   user: {
//     //     id: "6693a3b4d90c7f217f81c0e3",
//     //   },
//     //   body: {
//     //     modelId: "OW2ZZU1B3G1JH3U1",
//     //     uniqueId: "E3:04:70:78:2E:68:74:2F:64:2F:73:43:78:48:9F:A8",
//     //     vendor: "669394da294f4038136f29e6",
//     //     amount: 0,
//     //     currency: "rm",
//     //   },
//     // };

//     // b) Checking if vendor exist
//     const vendorData = await Vendors.findById({ _id: vendor })
//       .select(
//         "+plotnumber +address +city +state +country +zipCode location +storeCupsStock"
//       )
//       .catch((err) => {
//         return next(new ErrorHandler(`Something went wrong`, 400));
//       });
//     if (!vendorData) {
//       return next(
//         new ErrorHandler(
//           `Some error occurs so coffee order can't be completed.`,
//           200
//         )
//       );
//     }

//     // c) Fetching required customer details and checking for error
//     const customer = await Customers.findById({ _id: req.user.id });
//     if (!customer) return next(new ErrorHandler("Something went wrong", 404));

//     // This is my logic
//     const wallet = await CustomerWallet.findOne({ customer: req.user.id });
//     if (!wallet || !wallet.isWalletActive || wallet.cupCredits <= 0) {
//       return next(
//         new ErrorHandler(
//           "Customer does not have an active wallet with sufficient credits",
//           400
//         )
//       );
//     }

//     // c) Fetching cup details from inventory
//     const inventoryCup = await CupInventory.findOne({
//       cupModelUniqueId: req.body.modelId.toUpperCase(),
//     });
//     if (!inventoryCup)
//       return next(new ErrorHandler("Something went wrong", 404));

//     // d) Fetching vendor store stock
//     const vendorSoreStock = await VendorStoreStock.findOne({
//       vendor: vendorData._id,
//     });

//     if (!vendorSoreStock) {
//       return res.status(200).json({
//         success: false,
//         message: `Order can't be placed as this vendor don't have the cup stock`,
//         order: null,
//         payCode: null,
//       });
//     }
//     if (vendorSoreStock) {
//       let isCupOrderable = false;
//       vendorSoreStock.cups.forEach((data) => {
//         let storeCupID = data.cupID.toString().toUpperCase();
//         let verifyId = inventoryCup._id.toString().toUpperCase();
//         if (storeCupID === verifyId) {
//           if (data.numberOfCups > 0) {
//             isCupOrderable = true;
//           }
//         }
//       });

//       if (!isCupOrderable) {
//         return res.status(200).json({
//           success: false,
//           message: `Order can't be placed as this vendor don't have the cup stock`,
//           order: null,
//           payCode: null,
//         });
//       }
//     }
//     // d) Checking if coffee cup detail in database
//     const isUniqueCupDetailExisted = await Cups.findOne({
//       cupID: inventoryCup._id,
//       cupModelUniqueId: req.body.modelId.toUpperCase(),
//       cupUniqueId: req.body.uniqueId.toUpperCase(),
//     });

//     if (
//       isUniqueCupDetailExisted &&
//       isUniqueCupDetailExisted.isOrderable === false
//     ) {
//       return next(
//         new ErrorHandler(
//           `Order is not placeable as cup is not yet returned by customer to any vendor`,
//           200
//         )
//       );
//     }

//     // g) Creating new order
//     const order = await Order.create({
//       cupID: inventoryCup._id,
//       orderStatus: "pending",
//       orderTime: Date.now(),
//       customer: req.user.id,
//       fromVendor: vendorData._id,
//       orderAmount: amount,
//       currency: currency.toUpperCase() || "RM",
//       cupModelUniqueId: modelId.toUpperCase(),
//       cupUniqueId: uniqueId.toUpperCase(),
//     });

//     // Generating hash code
//     const first = "NFC_Cup_Order_Payment";
//     const second = "" + amount;
//     const third = "" + order._id;
//     const hashData = first + second + third;
//     const hmac = crypto.createHmac(
//       "md5",
//       hashData,
//       process.env.SENANGPAY_SECRET_KEY
//     );
//     const hashCode = hmac.digest("hex");

//     // This is also my code.
//     wallet.cupCredits -= amount;
//     await wallet.save();

//     res.status(200).json({
//       success: true,
//       message: "New orders",
//       order,
//       payCode: hashCode,
//     });
//   }
// );

// With console.logs
// exports.projectName_Customer_New_Coffee_Order = CatchAsync(
//   async (req, res, next) => {
//     console.log("New coffee order initiated");

//     // a) Destructuring data and checking for error
//     const { modelId, uniqueId, vendor, amount, currency } = req.body;
//     console.log("Order details:", {
//       modelId,
//       uniqueId,
//       vendor,
//       amount,
//       currency,
//     });

//     const customerBlocked = await Customers.findById(req.user.id).select(
//       "+isBlocked"
//     );
//     if (customerBlocked.isBlocked) {
//       console.log("Customer account is blocked");
//       return next(
//         new ErrorHandler(
//           "Your account is blocked. Please contact support.",
//           403
//         )
//       );
//     }

//     if (!modelId || !uniqueId || !vendor || !currency) {
//       console.log("Missing required details");
//       return next(new ErrorHandler(`Please provide all details`, 400));
//     }
//     if (amount && typeof amount !== "number") {
//       console.log("Invalid amount type");
//       return next(new ErrorHandler(`Please provide all details`, 400));
//     }

//     // b) Checking if vendor exist
//     console.log("Checking vendor:", vendor);
//     const vendorData = await Vendors.findById({ _id: vendor })
//       .select(
//         "+plotnumber +address +city +state +country +zipCode location +storeCupsStock"
//       )
//       .catch((err) => {
//         console.log("Error fetching vendor:", err);
//         return next(new ErrorHandler(`Something went wrong`, 400));
//       });
//     if (!vendorData) {
//       console.log("Vendor not found");
//       return next(
//         new ErrorHandler(
//           `Some error occurs so coffee order can't be completed.`,
//           200
//         )
//       );
//     }
//     console.log("Vendor found:", vendorData._id);

//     // c) Fetching required customer details and checking for error
//     console.log("Fetching customer details for:", req.user.id);
//     const customer = await Customers.findById({ _id: req.user.id });
//     if (!customer) {
//       console.log("Customer not found");
//       return next(new ErrorHandler("Something went wrong", 404));
//     }
//     console.log("Customer found:", customer._id);

//     console.log("Checking customer wallet");
//     const wallet = await CustomerWallet.findOne({ customer: req.user.id });
//     if (!wallet || !wallet.isWalletActive || wallet.cupCredits <= 0) {
//       console.log("Wallet issue:", {
//         wallet: !!wallet,
//         isActive: wallet?.isWalletActive,
//         credits: wallet?.cupCredits,
//       });
//       return next(
//         new ErrorHandler(
//           "Customer does not have an active wallet with sufficient credits",
//           400
//         )
//       );
//     }
//     console.log("Wallet valid. Credits:", wallet.cupCredits);

//     // c1) Check if the customer already has more than 2 active orders
//     console.log("Checking active orders for customer");
//     const activeOrdersCount = await Order.countDocuments({
//       customer: req.user.id,
//       isReturned: false,
//     });
//     console.log("Active orders count:", activeOrdersCount);

//     if (activeOrdersCount >= 2) {
//       console.log("Too many active orders");
//       return next(
//         new ErrorHandler(
//           "You have 2 active cup orders. Please return one of the cups first.",
//           400
//         )
//       );
//     }

//     // c) Fetching cup details from inventory
//     console.log("Fetching cup from inventory:", req.body.modelId);
//     const inventoryCup = await CupInventory.findOne({
//       cupModelUniqueId: req.body.modelId.toUpperCase(),
//     });
//     if (!inventoryCup) {
//       console.log("Cup not found in inventory");
//       return next(new ErrorHandler("Something went wrong", 404));
//     }
//     console.log("Cup found in inventory:", inventoryCup._id);

//     // d) Fetching vendor store stock
//     console.log("Checking vendor store stock");
//     const vendorSoreStock = await VendorStoreStock.findOne({
//       vendor: vendorData._id,
//     });

//     if (!vendorSoreStock) {
//       console.log("No store stock found for vendor");
//       // return res.status(200).json({
//       //   success: false,
//       //   message: `Order can't be placed as this vendor don't have the cup stock`,
//       //   order: null,
//       //   payCode: null,
//       // });
//       return next(
//         new ErrorHandler(
//           `Order can't be placed as this vendor don't have the cup stock`,
//           400
//         )
//       );
//     }

//     console.log("Checking if cup is orderable from vendor stock");
//     if (vendorSoreStock) {
//       let isCupOrderable = false;
//       vendorSoreStock.cups.forEach((data) => {
//         let storeCupID = data.cupID.toString().toUpperCase();
//         let verifyId = inventoryCup._id.toString().toUpperCase();
//         if (storeCupID === verifyId) {
//           if (data.numberOfCups > 0) {
//             isCupOrderable = true;
//           }
//         }
//       });

//       if (!isCupOrderable) {
//         console.log("Cup not orderable from this vendor");
//         // return res.status(200).json({
//         //   success: false,
//         //   message: `Order can't be placed as this vendor don't have the cup stock`,
//         //   order: null,
//         //   payCode: null,
//         // });
//         return next(
//           new ErrorHandler(
//             `Order can't be placed as this vendor don't have the cup stock`,
//             400
//           )
//         );
//       }
//     }
//     console.log("Cup is orderable from vendor stock");

//     // d) Checking if coffee cup detail in database
//     console.log("Checking cup details in database");
//     const isUniqueCupDetailExisted = await Cups.findOne({
//       cupID: inventoryCup._id,
//       cupModelUniqueId: req.body.modelId.toUpperCase(),
//       cupUniqueId: req.body.uniqueId.toUpperCase(),
//     });

//     if (
//       isUniqueCupDetailExisted &&
//       isUniqueCupDetailExisted.isOrderable === false
//     ) {
//       console.log("Cup is not orderable");
//       return next(
//         new ErrorHandler(
//           `Order is not placeable as cup is not yet returned by customer to any vendor`,
//           200
//         )
//       );
//     }

//     // g) Creating new order
//     console.log("Creating new order");
//     const order = await Order.create({
//       cupID: inventoryCup._id,
//       orderStatus: "success",
//       orderTime: Date.now(),
//       customer: req.user.id,
//       fromVendor: vendorData._id,
//       orderAmount: amount,
//       currency: currency.toUpperCase() || "RM",
//       cupModelUniqueId: modelId.toUpperCase(),
//       cupUniqueId: uniqueId.toUpperCase(),
//     });
//     console.log("New order created:", order._id);

//     //Testing  Updating vendor stock
//     console.log("Updating vendor stock");
//     vendorSoreStock.cups.forEach((data) => {
//       let storeCupID = data.cupID.toString().toUpperCase();
//       let verifyId = inventoryCup._id.toString().toUpperCase();
//       if (storeCupID === verifyId && data.numberOfCups > 0) {
//         data.numberOfCups -= 1;
//         console.log(
//           `Reduced stock for cup ${storeCupID}. New count: ${data.numberOfCups}`
//         );
//       }
//     });
//     await vendorSoreStock.save();

//     // Testing to update the cup for new customer
//     console.log("Updating cup details for new customer");
//     const updatedCup = await Cup.findOneAndUpdate(
//       {
//         cupID: inventoryCup._id,
//         cupModelUniqueId: modelId.toUpperCase(),
//         cupUniqueId: uniqueId.toUpperCase(),
//       },
//       {
//         $set: {
//           currentCustomer: req.user.id,
//           currentVendor: vendorData._id,
//           isOrderable: false,
//           orderDate: Date.now(),
//         },
//       },
//       { new: true }
//     );

//     if (!updatedCup) {
//       console.log("Failed to update cup details");
//       return next(new ErrorHandler("Failed to update cup details", 500));
//     }
//     console.log("Cup details updated:", updatedCup._id);

//     // Generating hash code
//     console.log("Generating hash code for payment");
//     const first = "NFC_Cup_Order_Payment";
//     const second = "" + amount;
//     const third = "" + order._id;
//     const hashData = first + second + third;
//     const hmac = crypto.createHmac(
//       "md5",
//       hashData,
//       process.env.SENANGPAY_SECRET_KEY
//     );
//     const hashCode = hmac.digest("hex");
//     console.log("Hash code generated");

//     console.log("Updating customer wallet");
//     wallet.cupCredits -= amount;
//     await wallet.save();
//     console.log("Wallet updated. New credit balance:", wallet.cupCredits);

//     console.log("Order process completed successfully");
//     res.status(200).json({
//       success: true,
//       message: "New orders",
//       order,
//       payCode: hashCode,
//     });
//   }
// );

// Failure protected
exports.projectName_Customer_New_Coffee_Order = CatchAsync(
  async (req, res, next) => {
    console.log("New coffee order initiated");

    // a) Destructuring data and checking for error
    const { modelId, uniqueId, vendor, amount, currency } = req.body;
    console.log("Order details:", {
      modelId,
      uniqueId,
      vendor,
      amount,
      currency,
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const customerBlocked = await Customers.findById(req.user.id)
        .select("+isBlocked")
        .session(session);

      if (customerBlocked.isBlocked) {
        console.log("Customer account is blocked");
        await session.abortTransaction();
        session.endSession();
        return next(
          new ErrorHandler(
            "Your account is blocked. Please contact support.",
            403
          )
        );
      }

      if (!modelId || !uniqueId || !vendor || !currency) {
        console.log("Missing required details");
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler(`Please provide all details`, 400));
      }
      if (amount && typeof amount !== "number") {
        console.log("Invalid amount type");
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler(`Please provide all details`, 400));
      }

      // b) Checking if vendor exist
      console.log("Checking vendor:", vendor);
      const vendorData = await Vendors.findById({ _id: vendor })
        .select(
          "+plotnumber +address +city +state +country +zipCode location +storeCupsStock"
        )
        .session(session)
        .catch((err) => {
          console.log("Error fetching vendor:", err);
          throw new ErrorHandler(`Something went wrong`, 400);
        });
      if (!vendorData) {
        console.log("Vendor not found");
        await session.abortTransaction();
        session.endSession();
        return next(
          new ErrorHandler(
            `Some error occurs so coffee order can't be completed.`,
            200
          )
        );
      }
      console.log("Vendor found:", vendorData._id);

      // c) Fetching required customer details and checking for error
      console.log("Fetching customer details for:", req.user.id);
      const customer = await Customers.findById({ _id: req.user.id }).session(
        session
      );
      if (!customer) {
        console.log("Customer not found");
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Something went wrong", 404));
      }
      console.log("Customer found:", customer._id);

      console.log("Checking customer wallet");
      const wallet = await CustomerWallet.findOne({
        customer: req.user.id,
      }).session(session);
      if (!wallet || !wallet.isWalletActive || wallet.cupCredits <= 0) {
        console.log("Wallet issue:", {
          wallet: !!wallet,
          isActive: wallet?.isWalletActive,
          credits: wallet?.cupCredits,
        });
        await session.abortTransaction();
        session.endSession();
        return next(
          new ErrorHandler(
            "Customer does not have an active wallet with sufficient credits",
            400
          )
        );
      }
      console.log("Wallet valid. Credits:", wallet.cupCredits);

      // c1) Check if the customer already has more than 2 active orders
      console.log("Checking active orders for customer");
      const activeOrdersCount = await Order.countDocuments({
        customer: req.user.id,
        isReturned: false,
      }).session(session);
      console.log("Active orders count:", activeOrdersCount);

      if (activeOrdersCount >= 2) {
        console.log("Too many active orders");
        await session.abortTransaction();
        session.endSession();
        return next(
          new ErrorHandler(
            "You have 2 active cup orders. Please return one of the cups first.",
            400
          )
        );
      }

      // c) Fetching cup details from inventory
      console.log("Fetching cup from inventory:", req.body.modelId);
      const inventoryCup = await CupInventory.findOne({
        cupModelUniqueId: req.body.modelId.toUpperCase(),
      }).session(session);
      if (!inventoryCup) {
        console.log("Cup not found in inventory");
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Something went wrong", 404));
      }
      console.log("Cup found in inventory:", inventoryCup._id);

      // d) Fetching vendor store stock
      console.log("Checking vendor store stock");
      const vendorSoreStock = await VendorStoreStock.findOne({
        vendor: vendorData._id,
      }).session(session);

      if (!vendorSoreStock) {
        console.log("No store stock found for vendor");
        await session.abortTransaction();
        session.endSession();
        return next(
          new ErrorHandler(
            `Order can't be placed as this vendor don't have the cup stock`,
            400
          )
        );
      }

      console.log("Checking if cup is orderable from vendor stock");
      let isCupOrderable = false;
      vendorSoreStock.cups.forEach((data) => {
        let storeCupID = data.cupID.toString().toUpperCase();
        let verifyId = inventoryCup._id.toString().toUpperCase();
        if (storeCupID === verifyId) {
          if (data.numberOfCups > 0) {
            isCupOrderable = true;
          }
        }
      });

      if (!isCupOrderable) {
        console.log("Cup not orderable from this vendor");
        await session.abortTransaction();
        session.endSession();
        return next(
          new ErrorHandler(
            `Order can't be placed as this vendor don't have the cup stock`,
            400
          )
        );
      }
      console.log("Cup is orderable from vendor stock");

      // d) Checking if coffee cup detail in database
      console.log("Checking cup details in database");
      const isUniqueCupDetailExisted = await Cups.findOne({
        cupID: inventoryCup._id,
        cupModelUniqueId: req.body.modelId.toUpperCase(),
        cupUniqueId: req.body.uniqueId.toUpperCase(),
      }).session(session);

      if (
        isUniqueCupDetailExisted &&
        isUniqueCupDetailExisted.isOrderable === false
      ) {
        console.log("Cup is not orderable");
        await session.abortTransaction();
        session.endSession();
        return next(
          new ErrorHandler(
            `Order is not placeable as cup is not yet returned by customer to any vendor`,
            200
          )
        );
      }

      // e) Updating vendor stock
      console.log("Updating vendor stock");
      vendorSoreStock.cups.forEach((data) => {
        let storeCupID = data.cupID.toString().toUpperCase();
        let verifyId = inventoryCup._id.toString().toUpperCase();
        if (storeCupID === verifyId && data.numberOfCups > 0) {
          data.numberOfCups -= 1;
          console.log(
            `Reduced stock for cup ${storeCupID}. New count: ${data.numberOfCups}`
          );
        }
      });
      await vendorSoreStock.save({ session });

      // f) Updating the cup for new customer
      console.log("Updating cup details for new customer");
      const updatedCup = await Cup.findOneAndUpdate(
        {
          cupID: inventoryCup._id,
          cupModelUniqueId: modelId.toUpperCase(),
          cupUniqueId: uniqueId.toUpperCase(),
        },
        {
          $set: {
            currentCustomer: req.user.id,
            currentVendor: vendorData._id,
            isOrderable: false,
            orderDate: Date.now(),
          },
        },
        { new: true, session }
      );

      if (!updatedCup) {
        console.log("Failed to update cup details");
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Failed to update cup details", 500));
      }
      console.log("Cup details updated:", updatedCup._id);

      // g) Creating new order
      console.log("Creating new order");
      const order = await Order.create(
        [
          {
            cupID: inventoryCup._id,
            orderStatus: "success",
            orderTime: Date.now(),
            customer: req.user.id,
            fromVendor: vendorData._id,
            orderAmount: amount,
            currency: currency.toUpperCase() || "RM",
            cupModelUniqueId: modelId.toUpperCase(),
            cupUniqueId: uniqueId.toUpperCase(),
          },
        ],
        { session }
      );
      console.log("New order created:", order[0]._id);

      // h) Generating hash code
      console.log("Generating hash code for payment");
      const first = "NFC_Cup_Order_Payment";
      const second = "" + amount;
      const third = "" + order[0]._id;
      const hashData = first + second + third;
      const hmac = crypto.createHmac(
        "md5",
        hashData,
        process.env.SENANGPAY_SECRET_KEY
      );
      const hashCode = hmac.digest("hex");
      console.log("Hash code generated");

      // i) Updating customer wallet
      console.log("Updating customer wallet");
      wallet.cupCredits -= amount;
      await wallet.save({ session });
      console.log("Wallet updated. New credit balance:", wallet.cupCredits);

      await session.commitTransaction();
      session.endSession();

      console.log("Order process completed successfully");
      res.status(200).json({
        success: true,
        message: "New orders",
        order: order[0],
        payCode: hashCode,
      });
    } catch (error) {
      console.error("Error during order processing:", error);
      await session.abortTransaction();
      session.endSession();
      next(new ErrorHandler("Order process failed", 500));
    }
  }
);

// without console.logs
// exports.projectName_Customer_New_Coffee_Order = CatchAsync(
//   async (req, res, next) => {
//     // a) Destructuring data and checking for error
//     const { modelId, uniqueId, vendor, amount, currency } = req.body;

//     if (!modelId || !uniqueId || !vendor || !currency) {
//       return next(new ErrorHandler(`Please provide all details`, 400));
//     }
//     if (amount && typeof amount !== "number") {
//       return next(new ErrorHandler(`Please provide all details`, 400));
//     }

//     // b) Checking if vendor exist
//     const vendorData = await Vendors.findById({ _id: vendor })
//       .select(
//         "+plotnumber +address +city +state +country +zipCode location +storeCupsStock"
//       )
//       .catch((err) => {
//         return next(new ErrorHandler(`Something went wrong`, 400));
//       });
//     if (!vendorData) {
//       return next(
//         new ErrorHandler(
//           `Some error occurs so coffee order can't be completed.`,
//           200
//         )
//       );
//     }

//     // c) Fetching required customer details and checking for error
//     const customer = await Customers.findById({ _id: req.user.id });
//     if (!customer) {
//       return next(new ErrorHandler("Something went wrong", 404));
//     }

//     const wallet = await CustomerWallet.findOne({ customer: req.user.id });
//     if (!wallet || !wallet.isWalletActive || wallet.cupCredits <= 0) {
//       return next(
//         new ErrorHandler(
//           "Customer does not have an active wallet with sufficient credits",
//           400
//         )
//       );
//     }

//     // c1) Check if the customer already has more than 2 active orders
//     const activeOrdersCount = await Order.countDocuments({
//       customer: req.user.id,
//       isReturned: false,
//     });

//     if (activeOrdersCount >= 2) {
//       return next(
//         new ErrorHandler(
//           "You have  2 active cup orders. Please return one of the cups first.",
//           400
//         )
//       );
//     }

//     // c) Fetching cup details from inventory
//     const inventoryCup = await CupInventory.findOne({
//       cupModelUniqueId: req.body.modelId.toUpperCase(),
//     });
//     if (!inventoryCup) {
//       return next(new ErrorHandler("Something went wrong", 404));
//     }

//     // d) Fetching vendor store stock
//     const vendorSoreStock = await VendorStoreStock.findOne({
//       vendor: vendorData._id,
//     });

//     if (!vendorSoreStock) {
//       return res.status(200).json({
//         success: false,
//         message: `Order can't be placed as this vendor don't have the cup stock`,
//         order: null,
//         payCode: null,
//       });
//     }

//     if (vendorSoreStock) {
//       let isCupOrderable = false;
//       vendorSoreStock.cups.forEach((data) => {
//         let storeCupID = data.cupID.toString().toUpperCase();
//         let verifyId = inventoryCup._id.toString().toUpperCase();
//         if (storeCupID === verifyId) {
//           if (data.numberOfCups > 0) {
//             isCupOrderable = true;
//           }
//         }
//       });

//       if (!isCupOrderable) {
//         return res.status(200).json({
//           success: false,
//           message: `Order can't be placed as this vendor don't have the cup stock`,
//           order: null,
//           payCode: null,
//         });
//       }
//     }

//     // d) Checking if coffee cup detail in database

//     const cupsiasda = await Cups.find({
//       cupID: inventoryCup._id,
//       cupModelUniqueId: req.body.modelId.toUpperCase(),
//       cupUniqueId: req.body.uniqueId.toUpperCase(),
//     });

//     const isUniqueCupDetailExisted = await Cups.findOne({
//       cupID: inventoryCup._id,
//       cupModelUniqueId: req.body.modelId.toUpperCase(),
//       cupUniqueId: req.body.uniqueId.toUpperCase(),
//     });

//     if (
//       isUniqueCupDetailExisted &&
//       isUniqueCupDetailExisted.isOrderable === false
//     ) {
//       return next(
//         new ErrorHandler(
//           `Order is not placeable as cup is not yet returned by customer to any vendor`,
//           200
//         )
//       );
//     }

//     // g) Creating new order
//     const order = await Order.create({
//       cupID: inventoryCup._id,
//       orderStatus: "success",
//       orderTime: Date.now(),
//       customer: req.user.id,
//       fromVendor: vendorData._id,
//       orderAmount: amount,
//       currency: currency.toUpperCase() || "RM",
//       cupModelUniqueId: modelId.toUpperCase(),
//       cupUniqueId: uniqueId.toUpperCase(),
//     });

//     //Testing  Updating vendor stock
//     vendorSoreStock.cups.forEach((data) => {
//       let storeCupID = data.cupID.toString().toUpperCase();
//       let verifyId = inventoryCup._id.toString().toUpperCase();
//       if (storeCupID === verifyId && data.numberOfCups > 0) {
//         data.numberOfCups -= 1;
//       }
//     });
//     await vendorSoreStock.save();

//     // Testing to updat the cup for new customer
//     const updatedCup = await Cup.findOneAndUpdate(
//       {
//         cupID: inventoryCup._id,
//         cupModelUniqueId: modelId.toUpperCase(),
//         cupUniqueId: uniqueId.toUpperCase(),
//       },
//       {
//         $set: {
//           currentCustomer: req.user.id,
//           currentVendor: vendorData._id,
//           isOrderable: false,
//           orderDate: Date.now(),
//         },
//       },
//       { new: true }
//     );

//     if (!updatedCup) {
//       return next(new ErrorHandler("Failed to update cup details", 500));
//     }

//     // Generating hash code
//     const first = "NFC_Cup_Order_Payment";
//     const second = "" + amount;
//     const third = "" + order._id;
//     const hashData = first + second + third;
//     const hmac = crypto.createHmac(
//       "md5",
//       hashData,
//       process.env.SENANGPAY_SECRET_KEY
//     );
//     const hashCode = hmac.digest("hex");

//     wallet.cupCredits -= amount;
//     await wallet.save();

//     res.status(200).json({
//       success: true,
//       message: "New orders",
//       order,
//       payCode: hashCode,
//     });
//   }
// );

// -------------------------------------------------------------------------------

// 03) CUSTOMER: New transactions
exports.projectName_Customer_New_Transaction = CatchAsync(
  async (req, res, next) => {
    // Destructuring information
    const {
      orderId,
      txnStatus,
      tokenID,
      orderAmount,
      currency,
      timeOftxn,
      dateOftxn,
    } = req.body;
    if (
      !orderId ||
      !txnStatus ||
      !tokenID ||
      !currency ||
      !timeOftxn ||
      !dateOftxn
    ) {
      return next(new ErrorHandler(`Please provide all details`, 404));
    }
    if (orderAmount && typeof orderAmount !== "number") {
      return next(new ErrorHandler(`Please provide all details`, 400));
    }

    // Fetching Order
    const orderData = await Order.findById({ _id: orderId }).catch((err) => {
      return next(new ErrorHandler(`Something went wrong`, 400));
    });

    // Checking if vendor exist
    const vendorExist = await Vendors.findById({
      _id: orderData.fromVendor,
    }).catch((err) => {
      return next(new ErrorHandler(`Something went wrong`, 400));
    });
    if (!vendorExist) {
      return next(
        new ErrorHandler(
          `Some error occurs so payment can't be completed.`,
          200
        )
      );
    }

    if (!orderData) {
      return next(
        new ErrorHandler(
          `Some error occurs so payment can't be completed.`,
          200
        )
      );
    }

    // Fetching Cup details
    const isCupOrderableCheck = await Cup.findOne({
      cupUniqueId: orderData.cupUniqueId,
    });
    if (isCupOrderableCheck && isCupOrderableCheck.isOrderable === false) {
      return next(
        new ErrorHandler(
          `Order is not placeable as cup is not yet returned by customer to any vendor`,
          200
        )
      );
    }

    // b) Checking transaction status
    const transaction = await Transactions.create({
      order: orderId.toUpperCase(),
      customer: req.user.id,
      tokenID: req.body.tokenID,
      txnStatus: req.body.txnStatus.toLowerCase(),
      vendor: orderData.fromVendor,
      cupUniqueId: orderData.cupUniqueId.toUpperCase(),
      cupModelUniqueId: orderData.cupModelUniqueId.toUpperCase(),
      orderAmount: req.body.orderAmount,
      currency: req.body.currency.toUpperCase() || "RM",
      timeOftxn: Date.now(),
    });

    // Updatating Order and
    if (transaction.txnStatus.toLowerCase() === "success") {
      if (!isCupOrderableCheck) {
        await Cups.create({
          cupID: orderData.cupID,
          cupUniqueId: orderData.cupUniqueId.toUpperCase(),
          cupModelUniqueId: orderData.cupModelUniqueId.toUpperCase(),
          currentVendor: orderData.fromVendor,
          currentCustomer: req.user.id,
          cupBoughtHistory: [],
          isOrderable: false,
          orderDate: Date.now(),
        });
      } else if (isCupOrderableCheck) {
        (isCupOrderableCheck.lastVendor = isCupOrderableCheck.currentVendor),
          (isCupOrderableCheck.currentVendor = orderData.fromVendor),
          (isCupOrderableCheck.currentCustomer = req.user.id);
        isCupOrderableCheck.isOrderable = false;
        isCupOrderableCheck.orderDate = Date.now();
        await isCupOrderableCheck.save();
      }
      // i) Updating vendor stock
      const vendorStock = await VendorStoreStock.findOne({
        vendor: orderData.fromVendor,
      });
      const cupDetailInInventory = await CupInInvenorty.findOne({
        cupModelUniqueId: orderData.cupModelUniqueId,
      });
      for (let i = 0; i < vendorStock.cups.length; i++) {
        if (
          vendorStock.cups[i].cupID.toString() === orderData.cupID.toString()
        ) {
          vendorStock.cups[i].numberOfCups -= 1;
          await vendorStock.save();
          break;
        }
      }

      // Updating Order
      orderData.orderTime = Date.now();
      orderData.orderStatus = "success";
      (orderData.currency = req.body.currency.toUpperCase() || "RM"),
        (orderData.orderAmount = req.body.orderAmount);
      (orderData.tnxID = transaction._id), await orderData.save();
    } else if (transaction.txnStatus.toUpperCase() === "FAIL") {
    }

    res.status(200).json({
      success: true,
      message: "New transaction",
      transaction,
    });
  }
);

// 04) ✅ CUSTOMER: All Orders
exports.projectName_Customer_All_Coffee_Orders = CatchAsync(
  async (req, res, next) => {
    // a) Fetching customer ID
    const customerID = req.user.id;

    // b) Fetching all orders
    const orders = await Order.find({ customer: customerID })
      .sort({ createdAt: -1 })
      .populate("cupID", "cupImages cupType cupSize")
      .populate("fromVendor", "name")
      .catch((err) => {
        return next(new ErrorHandler("Something went wrong", 400));
      });

    // c) Checking if orders exist
    if (!orders || orders.length === 0)
      return next(new ErrorHandler(`No data found`, 200));

    // d) Sending response
    res.status(200).json({
      success: true,
      message: `All orders`,
      length: orders.length,
      orders,
    });
  }
);

// 05) ✅ CUSTOMER: All transactions
exports.projectName_Customer_All_Transactions_Made = CatchAsync(
  // async (req, res, next) => {
  //   // a) Fetching customer ID
  //   const customerID = req.user.id;

  //   // b) Fetching all transactions
  //   const transactions = await Transactions.find({ customer: customerID })
  //     .populate("vendor", "name profilePicture")
  //     .catch((err) => {
  //       return next(new ErrorHandler("Something went wrong", 400));
  //     });

  //   // c) Checking if transactions exist
  //   if (!transactions || transactions.length === 0)
  //     return next(new ErrorHandler(`No data found`, 200));

  //   // d) Sending response
  //   res.status(200).json({
  //     success: true,
  //     message: `All transactions`,
  //     length: transactions.length,
  //     transactions,
  //   });
  // }
  async (req, res, next) => {
    // a) Fetching customer ID
    const customerID = req.user.id;

    // b) Fetching all Stripe transactions for the customer
    const transactions = await StripeTransaction.find({
      customer_id: customerID,
    })
      .populate("package_id")
      .populate("customer_id") // Adjust the fields to populate as needed
      .catch((err) => {
        return next(new ErrorHandler("Something went wrong", 400));
      });

    // c) Checking if transactions exist
    if (!transactions || transactions.length === 0)
      return next(new ErrorHandler(`No data found`, 200));

    // d) Sending response
    res.status(200).json({
      success: true,
      message: `All transactions`,
      length: transactions.length,
      transactions,
    });
  }
);

// 06) ✅ CUSTOMER: All orders from a vendor
exports.projectName_Customer_All_Orders_From_A_Vendor = CatchAsync(
  async (req, res, next) => {
    // a) fetching vendor and customer ID's
    const customerID = req.user.id;
    const vendorID = req.params.vid;

    // b) Fetching customer orders form a vendor
    const orders = await Order.find({
      customer: customerID,
      vendor: vendorID,
    }).catch((err) => {
      return next(new ErrorHandler("Something went wrong", 400));
    });

    // c) Checking if orders exist
    if (!orders || orders.length === 0)
      return next(new ErrorHandler(`No orders found`, 200));

    // d) Sending response
    res.status(200).json({
      success: true,
      message: `All orders from a vendor`,
      length: orders.length,
      orders,
    });
  }
);

// 07) ✅ CUSTOMER: All payments to a vendor
exports.projectName_Customer_All_Payments_To_A_Vendor = CatchAsync(
  async (req, res, next) => {
    // a) fetching vendor and customer ID's
    const customerID = req.user.id;
    const vendorID = req.params.vid;

    // b) Fetching customer orders form a vendor
    const transactions = await Transactions.find({
      customer: customerID,
      vendor: vendorID,
    }).catch((err) => {
      return next(new ErrorHandler("Something went wrong", 400));
    });

    // c) Checking if transactions exist
    if (!transactions || transactions.length === 0)
      return next(new ErrorHandler(`No transactions found`, 200));

    // d) Sending response
    res.status(200).json({
      success: true,
      message: `All transaction to vendor`,
      length: transactions.length,
      transactions,
    });
  }
);

// 08) ✅ CUSTOMER: CUSTOMER: Single order details
exports.projectName_Customer_Single_Coffee_Orders_details = CatchAsync(
  async (req, res, next) => {
    // a) Fetching order ID
    const orderID = req.params.id;

    // b) Fetching order details
    const order = await Order.findById({ _id: orderID })
      .populate(
        "cupID",
        "cupImages cupType cupSize cupModelUniqueId cupCapacity"
      )
      .populate(
        "fromVendor",
        "name primaryEmail countryCode primaryContactNumber plotnumber address city state country zipCode profilePicture"
      )
      .catch((err) => {
        return next(new ErrorHandler("Something went wrong", 400));
      });

    // c) Checking if order exist
    if (!order) return next(new ErrorHandler("Order not found", 200));

    // c) Sending response
    res.status(200).json({
      success: true,
      message: "Single order details",
      order,
    });
  }
);

// 09) ✅ CUSTOMER: Single transaction details
exports.projectName_Customer_Single_Transaction_Details = CatchAsync(
  async (req, res, next) => {
    // a) Fetching txn ID
    const txnID = req.params.id;

    // b) Fetching transaction details
    const transaction = await Transactions.findById({ _id: txnID })
      .populate("customer")
      .populate(
        "vendor",
        "name primaryEmail countryCode primaryContactNumber plotnumber address city state country zipCode profilePicture"
      )
      .populate({
        path: "order",
        select: "cupID",
        populate: {
          path: "cupID",
          select: "cupCapacity cupImages cupPrice cupSize cupType",
        },
      })
      .catch((err) => {
        return next(new ErrorHandler("Something went wrong", 400));
      });

    // c) Checking if transaction exist
    if (!transaction)
      return next(new ErrorHandler("Transaction not found", 200));
    // d) Sending response
    res.status(200).json({
      success: true,
      message: `Single transaction details`,
      transaction,
    });
  }
);

// 10) CUSTOMER: All ordered cup details
exports.projectName_Customer_All_Cup_Ordered_List = CatchAsync(
  async (req, res, next) => {
    // a) Fetching all orders by a customer
    const tempOrderData = await Order.find({
      customer: req.user.id,
      orderStatus: { $ne: "failed" },
    })
      .sort({ createdAt: -1 })
      .select("cupModelUniqueId cupUniqueId orderTime isReturned cupID")
      .populate("cupID", "cupImages cupType")
      .catch((err) => {
        return next(new ErrorHandler("Something went wrong", 400));
      });

    // e) Sending response
    res.status(200).json({
      success: true,
      message: "Cup lists",
      cupList: tempOrderData,
    });
  }
);

// 11) CUSTOMER: Near by vendor store
exports.projectName_Customer_Nearby_Vendor_Store = CatchAsync(
  async (req, res, next) => {
    // let cuLoc = Geolocation.getCurrentPosition()
    const vendorLocations = await Vendors.find().select("name location");
    if (!vendorLocations || vendorLocations.length === 0) {
      return next(
        new ErrorHandler(`No nearby vendors available at the moment.`, 200)
      );
    }
    res.status(200).json({
      success: true,
      message: "Near by vendor stores",
      cuLoc,
    });
  }
);

// 12) CUSTOMER: Returnable cup list
exports.projectName_Customer_Returnable_Cup_To_Vendor_List = CatchAsync(
  async (req, res, next) => {
    // a) Fetching order details
    const returnableCup = await Order.find({
      customer: req.user.id,
      orderTime: { $gte: Date.now() - 170000000 },
    })
      .sort({ createdAt: -1 })
      .catch((err) => {
        return next(new ErrorHandler("Something went wrong", 400));
      });

    // b) Checking if there is any returnable cups
    if (!returnableCup || returnableCup.length === 0)
      return next(new ErrorHandler("No returnable cup found", 200));

    // c) Sending response
    res.status(200).json({
      success: true,
      message: `Returnable cup`,
      returnableCup,
    });
  }
);

// 14) Checking cup return condition
exports.projectName_Customer_Returning_Cup_Status_Checking = CatchAsync(
  async (req, res, next) => {
    // Destructuring Data
    const { uniqueId } = req.body;
    const customerID = req.user.id;

    // Fetching cups details
    const returnCup = await Cups.findOne({
      cupUniqueId: uniqueId,
      currentCustomer: customerID,
    });

    // Checking if data exist
    if (!returnCup) return next(new ErrorHandler(`No data found`, 404));

    // Sending response
    res.status(200).json({
      success: true,
      message: "Returned cup detials",
      returnCup,
    });
  }
);

// ) CUSTOMER: Ordered coffee cup details
exports.projectName_Customer_Ordered_Single_Cup_Information = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring cup unique ID from request header
    const cupUniqueId = req.params.cid;
    const singleCupDetails = await Cup.findOne({
      cupUniqueId: cupUniqueId,
    }).catch((err) => {
      return next(new ErrorHandler("Something went wrong", 400));
    });

    // b)
    if (!singleCupDetails) {
      return next(new ErrorHandler(`No cup details found`, 404));
    }

    // c)
    res.status(200).json({
      success: true,
      message: "Ordered cup information",
      singleCupDetails,
    });
  }
);

// 02) CUSTOMER: Cup deTagging and tagging
// without console.logs
// exports.projectName_Customer_DeTagging_Tagging_Information_Of_Cup = CatchAsync(
//   async (req, res, next) => {
//     // a) Destructuring data
//     const customerID = req.user.id;
//     const { modelID, uniqueID, vendorID } = req.body;
//     if (!modelID || !uniqueID || !vendorID) {
//       return res.status(400).json({
//         success: false,
//         message: `Please provide all details!`,
//       });
//     }

//     // Fetching cup history
//     const cupHistory = await Cups.findOne({
//       cupModelUniqueId: modelID,
//       cupUniqueId: uniqueID,
//     })
//       .populate("cupID")
//       .select("+returnTime");
//     if (cupHistory.isOrderable) {
//       return res.status(200).json({
//         success: true,
//         message: "Cup has been returned.",
//       });
//     }

//     // Checking return condition
//     let orderTime = cupHistory.orderDate.getTime();
//     // let returnDate = cupHistory.cupID.returnTime * 86400000;
//     let returnPeriod = cupHistory.cupID.returnTime * 86400000;
//     const currentTime = Date.now();
//     // if (orderTime >= returnDate) {
//     //   return res.status(200).json({
//     //     success: false,
//     //     message: `Cup return time period has been passed!`,
//     //   });
//     // }

//     if (currentTime > orderTime + returnPeriod) {
//       return res.status(200).json({
//         success: false,
//         message: `Cup return time period has been passed!`,
//       });
//     }

//     // Fetching order details
//     const order = await Order.findOne({
//       customer: customerID,
//       cupModelUniqueId: modelID,
//       cupUniqueId: uniqueID,
//       orderStatus: "success",
//       fromVendor: cupHistory.currentVendor,
//       isReturned: false,
//     }).select("+returnedVendor +isReturned");

//     if (!order) {
//       return next(new ErrorHandler("Something went wrong", 404));
//     }

//     // Fetching Vendor Details
//     const vendorData = await Vendors.findById({ _id: vendorID }).select(
//       "+storeCupsStock"
//     );
//     let vendorStock = await VendorStoreStock.findOne({
//       _id: vendorData.storeCupsStock,
//     });

//     let CupNewHistory = {
//       customer: cupHistory.currentCustomer,
//       fromVendor: order.fromVendor,
//       order: order._id,
//       purchaseDate: order.orderTime,
//       returnVendor: vendorData._id,
//       returnDate: Date.now(),
//     };

//     if (!vendorStock) {
//       const stID = await VendorStoreStock.create({
//         vendor: vendorData._id,
//         primaryEmail: vendorData.primaryEmail,
//         cups: [
//           {
//             cupID: cupHistory.cupID._id,
//             numberOfCups: 1,
//           },
//         ],
//       });
//       vendorData.storeCupsStock = stID._id;
//       await vendorData.save();
//     } else {
//       let cupExist = false;
//       for (let i = 0; i < vendorStock.cups.length; i++) {
//         let vendorCupCheck = vendorStock.cups[i].cupID.toString();
//         let orderCupCheck = cupHistory.cupID._id.toString();
//         if (vendorCupCheck === orderCupCheck) {
//           vendorStock.cups[i].numberOfCups += 1;
//           cupExist = true;
//           break;
//         }
//       }

//       if (!cupExist) {
//         let temp = {
//           cupID: cupHistory.cupID._id,
//           numberOfCups: 1,
//         };
//         vendorStock.cups.push(temp);
//       }
//       await vendorStock.save();
//     }

//     cupHistory.isOrderable = true;
//     cupHistory.lastVendor = order.fromVendor;
//     cupHistory.currentVendor = vendorData._id;
//     cupHistory.currentCustomer = null;
//     cupHistory.orderDate = undefined;
//     cupHistory.cupBoughtHistory.push(CupNewHistory);
//     await cupHistory.save();

//     order.returnedVendor = vendorData._id;
//     order.isReturned = true;
//     await order.save();

//     // Sending response
//     res.status(200).json({
//       success: true,
//       message: "Cup return successful!",
//       vendorStock,
//     });
//   }
// );
// with console.logs
exports.projectName_Customer_DeTagging_Tagging_Information_Of_Cup = CatchAsync(
  async (req, res, next) => {
    console.log("Customer DeTagging/Tagging Information Of Cup initiated");

    // a) Destructuring data
    const customerID = req.user.id;
    const { modelID, uniqueID, vendorID } = req.body;
    console.log("Request data:", { customerID, modelID, uniqueID, vendorID });

    if (!modelID || !uniqueID || !vendorID) {
      console.log("Missing required details");
      return res.status(400).json({
        success: false,
        message: `Please provide all details!`,
      });
    }

    // Fetching cup history
    console.log("Fetching cup history");
    const cupHistory = await Cups.findOne({
      cupModelUniqueId: modelID,
      cupUniqueId: uniqueID,
    })
      .populate("cupID")
      .select("+returnTime");
    console.log(
      "Cup history found:",
      cupHistory ? cupHistory._id : "Not found"
    );

    if (cupHistory.isOrderable) {
      console.log("Cup is already orderable");
      return res.status(200).json({
        success: true,
        message: "Cup has been returned.",
      });
    }

    // Checking return condition
    console.log("Checking return condition");
    let orderTime = cupHistory.orderDate.getTime();
    let returnPeriod = cupHistory.cupID.returnTime * 86400000;
    const currentTime = Date.now();
    console.log("Time details:", { orderTime, returnPeriod, currentTime });

    if (currentTime > orderTime + returnPeriod) {
      console.log("Cup return time period has passed");
      return res.status(200).json({
        success: false,
        message: `Cup return time period has been passed!`,
      });
    }

    // Fetching order details
    console.log("Fetching order details");
    const order = await Order.findOne({
      customer: customerID,
      cupModelUniqueId: modelID,
      cupUniqueId: uniqueID,
      orderStatus: "success",
      fromVendor: cupHistory.currentVendor,
      isReturned: false,
    }).select("+returnedVendor +isReturned");

    if (!order) {
      console.log("Order not found");
      return next(new ErrorHandler("Something went wrong", 404));
    }
    console.log("Order found:", order._id);

    // Fetching Vendor Details
    console.log("Fetching vendor details");
    const vendorData = await Vendors.findById({ _id: vendorID }).select(
      "+storeCupsStock"
    );
    console.log("Vendor found:", vendorData._id);

    let vendorStock = await VendorStoreStock.findOne({
      _id: vendorData.storeCupsStock,
    });
    console.log(
      "Vendor stock found:",
      vendorStock ? vendorStock._id : "Not found"
    );

    let CupNewHistory = {
      customer: cupHistory.currentCustomer,
      fromVendor: order.fromVendor,
      order: order._id,
      purchaseDate: order.orderTime,
      returnVendor: vendorData._id,
      returnDate: Date.now(),
    };
    console.log("New cup history entry created");

    if (!vendorStock) {
      console.log("Creating new vendor stock");
      const stID = await VendorStoreStock.create({
        vendor: vendorData._id,
        primaryEmail: vendorData.primaryEmail,
        cups: [
          {
            cupID: cupHistory.cupID._id,
            numberOfCups: 1,
          },
        ],
      });
      vendorData.storeCupsStock = stID._id;
      await vendorData.save();
      console.log("New vendor stock created:", stID._id);
    } else {
      console.log("Updating existing vendor stock");
      let cupExist = false;
      for (let i = 0; i < vendorStock.cups.length; i++) {
        let vendorCupCheck = vendorStock.cups[i].cupID.toString();
        let orderCupCheck = cupHistory.cupID._id.toString();
        if (vendorCupCheck === orderCupCheck) {
          vendorStock.cups[i].numberOfCups += 1;
          cupExist = true;
          console.log("Cup count incremented for existing cup");
          break;
        }
      }

      if (!cupExist) {
        let temp = {
          cupID: cupHistory.cupID._id,
          numberOfCups: 1,
        };
        vendorStock.cups.push(temp);
        console.log("New cup added to vendor stock");
      }
      await vendorStock.save();
    }

    console.log("Updating cup history");
    cupHistory.isOrderable = true;
    cupHistory.lastVendor = order.fromVendor;
    cupHistory.currentVendor = vendorData._id;
    cupHistory.currentCustomer = null;
    cupHistory.orderDate = undefined;
    cupHistory.cupBoughtHistory.push(CupNewHistory);
    await cupHistory.save();
    console.log("Cup history updated");

    console.log("Updating order");
    order.returnedVendor = vendorData._id;
    order.isReturned = true;
    await order.save();
    console.log("Order updated");

    // Sending response
    console.log("Sending success response");
    res.status(200).json({
      success: true,
      message: "Cup return successful!",
      vendorStock,
    });
  }
);

// 02) CUSTOMER: Cup deTagging and tagging
exports.projectName_Customer_Fetching_Returnable_Cups = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring data
    const customerID = req.user.id;

    const isCups = await Cups.find({ currentCustomer: customerID })
      .select("cupID currentVendor orderDate")
      .populate("cupID", "cupType cupSize returnTime")
      .populate("currentVendor", "name address city")
      .populate({
        path: "currentCustomer",
        select: "_id username primaryContactNumber",
      });

    if (!isCups || isCups.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No cups to return",
      });
    }

    // Sending response
    res.status(200).json({
      success: true,
      message: "Cups can be return successful!",
      isCups,
    });
  }
);
