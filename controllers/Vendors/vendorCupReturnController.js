const catchAsync = require("../../errors/catchAsync");
const Vendors = require("../../models/Vendors/Vendor");
const Cups = require("../../models/Cups/Cup");
const Orders = require("../../models/Orders/Order");
const ErrorHandler = require("../../utils/errorHandler");
const VendorStoreStocks = require("../../models/Vendors/StoreCupsStock");
const {
  orderCupsResponse,
  cupsResponses,
} = require("../../utils/responseObjects");
const CupInventory = require("../../models/Cups/CupInventory");

/*
    Index:
        01) Fetching order and ordered cup details
        02) Checking if cup is eligible for return
        03) Cup deTagging and tagging
        04) Cup returning payment
        05) Final cup return confirmation and vendor stock update
*/

// 01) CUSTOMER: Checking if cup is eligible for return
exports.projectName_Vendor_Checking_Cup_Return_Condition = catchAsync(
  async (req, res, next) => {
    // a) Destructuring data
    const { modelID, uniqueID } = req.body;

    const cupHistory = await Cups.findOne({
      cupModelUniqueId: modelID,
      cupUniqueId: uniqueID,
    })
      .populate("cupID")
      .select("+returnTime");
    let returning_time = cupHistory.cupID.returnTime * 86400000;

    if (!cupHistory) {
      return next(new ErrorHandler("Something went wrong", 404));
    }

    if (cupHistory.isOrderable) {
      return res.status(200).json({
        success: false,
        message: "This cup has already been returned or not ordered yet",
        cupHistory,
      });
    } else {
      if (cupHistory.orderDate < returning_time && !cupHistory.isOrderable) {
        return res.status(200).json({
          success: false,
          message: `This cup is not returnable as return window time already passed.`,
          cupHistory,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Cup can be return",
      cupHistory,
    });
  }
);

// 02) CUSTOMER: Cup detagging and tagging
exports.projectName_Vendor_Detagging_Tagging_Information_Of_Cup = catchAsync(
  async (req, res, next) => {
    // a) Destructuring data
    const { modelID, uniqueID } = req.body;

    if (!modelID || !uniqueID) {
      return next(new ErrorHandler("Please provide modelID and uniqueID", 400));
    }

    const cupHistory = await Cups.findOne({
      cupModelUniqueId: modelID,
      cupUniqueId: uniqueID,
    })
      .populate("cupID")
      .select("+returnTime");

    if (!cupHistory) {
      return next(new ErrorHandler("Something went wrong", 404));
    }

    if (cupHistory.isOrderable) {
      return res.status(200).json({
        success: false,
        message: "Cup has been returned.",
      });
    }

    // Checking return condition
    let orderTime = cupHistory.orderDate.getTime();
    let returnDate = cupHistory.cupID.returnTime * 86400000;
    if (orderTime >= returnDate) {
      return res.status(200).json({
        success: false,
        message: `Cup return time period has been passed!`,
      });
    }

    const order = await Orders.findOne({
      customer: cupHistory.currentCustomer,
      cupModelUniqueId: modelID,
      cupUniqueId: uniqueID,
      orderStatus: "success",
      fromVendor: cupHistory.currentVendor,
      isReturned: false,
    }).select("+returnedVendor +isReturned");

    if (!order) {
      return next(new ErrorHandler("Something went wrong", 404));
    }

    const vendorData = await Vendors.findById({ _id: req.user.id }).select(
      "+storeCupsStock"
    );
    let vendorStock = await VendorStoreStocks.findOne({
      _id: vendorData.storeCupsStock,
    });

    let CupNewHistory = {
      customer: cupHistory.currentCustomer,
      fromVendor: order.fromVendor,
      order: order._id,
      purchaseDate: order.orderTime,
      returnVendor: vendorData._id,
      returnDate: Date.now(),
    };

    if (!vendorStock) {
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
    } else {
      let cupExist = false;
      for (let i = 0; i < vendorStock.cups.length; i++) {
        let vendorCupCheck = vendorStock.cups[i].cupID.toString();
        let orderCupCheck = cupHistory.cupID._id.toString();
        if (vendorCupCheck === orderCupCheck) {
          vendorStock.cups[i].numberOfCups += 1;
          cupExist = true;
          break;
        }
      }

      if (!cupExist) {
        let temp = {
          cupID: cupHistory.cupID._id,
          numberOfCups: 1,
        };
        vendorStock.cups.push(temp);
      }
      await vendorStock.save();
    }

    cupHistory.isOrderable = true;
    cupHistory.lastVendor = order.fromVendor;
    cupHistory.currentVendor = vendorData._id;
    cupHistory.currentCustomer = null;
    cupHistory.orderDate = undefined;
    cupHistory.cupBoughtHistory.push(CupNewHistory);
    await cupHistory.save();

    order.returnedVendor = vendorData._id;
    order.isReturned = true;
    await order.save();

    // Sending response
    res.status(200).json({
      success: true,
      message: "Cup return successful!",
      vendorStock,
    });
  }
);

// 04) CUSTOMER: Cup returning payment
exports.projectName_Vendor_Cup_Return_Payment_To_Customer = catchAsync(
  async (req, res, next) => {
    res.status(200).json({
      success: true,
      message: "Yeah!",
    });
  }
);

// 05) CUSTOMER: Final cup return confirmation and vendor stock update
exports.projectName_Vendor_Confirm_Return_And_Stock_Update = catchAsync(
  async (req, res, next) => {
    res.status(200).json({
      success: true,
      message: "Yeah!",
    });
  }
);

// 00) VENDOR: All retured cup
exports.projectName_Vendor_All_Returned_Cups_By_Customer = catchAsync(
  async (req, res, next) => {
    // a) Fetching details
    const returned_Cups = await Orders.find({ returnedVendor: req.user.id })
      .populate(
        "customer",
        "firstname middlename lastname primaryEmail countryCode primaryContactNumber"
      )
      .populate("cupID")
      .populate(
        "fromVendor",
        "name primaryEmail countryCode primaryContactNumber"
      )
      .populate(
        "returnedVendor",
        "name primaryEmail countryCode primaryContactNumber"
      )
      .sort({ updatedAt: -1 });

    if (returned_Cups.length < 1 || !returned_Cups) {
      return res.status(200).json({
        success: true,
        message: "No cups returned yet",
      });
    }

    orderCupsResponse.returnedCupsResponse(res, 200, returned_Cups);
  }
);

// scan cup and get detail

// I javed added the code here for single cup scan

// 04) CUSTOMER: Particular Cup Details
exports.projectName_Vendor_Single_Cup_Details_After_Scan = catchAsync(
  async (req, res, next) => {
    const { uniqueID } = req.body;
    // Fetching data
    const isCupData = await Cups.findOne({
      cupUniqueId: uniqueID,
    })
      .populate(
        "currentVendor",
        "profilePicture name plotnumber address city state country zipCode"
      )
      .populate(
        "currentCustomer",
        "firstname, middlename lastname profilePicture"
      );
    // const isCupData = await Cups.findOne({
    //   cupUniqueId: "CUP" + uniqueID.split(":").join("").toUpperCase(),
    // })
    //   .populate(
    //     "currentVendor",
    //     "profilePicture name plotnumber address city state country zipCode"
    //   )
    //   .populate(
    //     "currentCustomer",
    //     "firstname, middlename lastname profilePicture"
    //   );
    if (!isCupData) {
      return next(new ErrorHandler("No cup data found", 404));
    }
    // Fetching cup detail using model ID
    const cupDetails = await CupInventory.findOne({
      _id: isCupData.cupID,
    }).select(
      "cupModelUniqueId cupSize cupType cupCapacity cupPrice currency cupImages loyaltyPoints"
    );
    let returnObject = {
      modelID: cupDetails.cupModelUniqueId.toUpperCase(),
      uniqueID: uniqueID.split(":").join("").toUpperCase(),
      cupSize:
        cupDetails.cupSize.charAt(0).toUpperCase() +
        cupDetails.cupSize.slice(1),
      cupType:
        cupDetails.cupType.charAt(0).toUpperCase() +
        cupDetails.cupType.slice(1),
      capacity: cupDetails.cupCapacity,
      price: cupDetails.cupPrice,
      currency: cupDetails.currency.toUpperCase(),
      cupImages: cupDetails.cupImages,
      point: cupDetails.loyaltyPoints,
      isOrderable: true,
      vendor: null,
      orderDate: null,
    };
    if (isCupData) {
      returnObject.isOrderable = isCupData.isOrderable;
      returnObject.vendor = isCupData.currentVendor;
      if (!isCupData.isOrderable) {
        returnObject.orderDate = isCupData.orderDate;
        returnObject.customer = isCupData.currentCustomer;
      }
    }
    res.status(200).json({
      success: true,
      message: "Cup details",
      cupData: returnObject,
    });
  }
);
