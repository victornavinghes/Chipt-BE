// BuiltIn Module Import

// Database Import
const Vendors = require("../../models/Vendors/Vendor.js");
const Customers = require("../../models/Customer/Customer.js");
const CupOrders = require("../../models/Orders/Order.js");
const StoreCupsStock = require("../../models/Vendors/StoreCupsStock.js");
const CupStockRequest = require("../../models/Vendors/CupStockRequest.js");
const CupInventory = require("../../models/Cups/CupInventory.js");

// User Created Module Import
const CatchAsync = require("../../errors/catchAsync.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const { storeStockResponse } = require("../../utils/responseObjects.js");

/*
    Index: 
        01) Vendor store gallery images
        02) All vendors cups stock in store
        03) All vendors raised cup requests
        04) All vendors pending stock requests
        05) All vendors rejected stock requests
        06) All vendors accepted stock requests
        07) Single vendor cups stock in store
        08) Single vendor all raised cup requests
        09) Single vendor pending stock requests
        10) Single vendor rejected stock requests
        11) Single vendor accepted stock requests
        12) Single stock reuest information
        13) Dashboard Information for single vendor
*/

// 01) ✅  VENDOR: Fetching gallery images
exports.projectName_Utils_Vendor_Account_All_Store_Images = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor id
    if (req.params.id) {
      vendorID = req.params.id;
    } else {
      const vendor = await Vendors.findById({ _id: req.user.id }).select(
        "+primaryRole"
      );
      if (vendor.primaryRole.toLowerCase() === "vendor") {
        vendorID = req.user.id;
      } else {
        return next(new ErrorHandler(`Vendor not found.`, 200));
      }
    }

    // b) Fetching vendor details
    const vendor = await Vendors.findById({ _id: vendorID })
      .select("storeImages")
      .catch((err) => {
        return next(new ErrorHandler(`Something went wrong.`, 404));
      });

    // c) Checking if vendor have store gallery images
    if (!vendor) {
      return next(new ErrorHandler(`Vendor not found`, 200));
    }
    if (!vendor.storeImages || vendor.storeImages.length === 0) {
      return next(new ErrorHandler(`No images exist`, 200));
    }

    res.status(200).json({
      success: true,
      message: "Vendor store gallery",
      vendor,
    });
  }
);

// 02) ✅ UTILS: All vendors cups stock in store
exports.projectName_Utils_All_Vendors_Store_Cups_Stocks = CatchAsync(
  async (req, res, next) => {
    // a) Fetching stock information
    const vendorStock = await StoreCupsStock.find()
      .populate(
        "vendor",
        "name primaryEmail primaryContactNumber profilePicture"
      )
      .sort({ createdAt: -1 });
    if (!vendorStock || vendorStock.length === 0)
      return next(new ErrorHandler(`No data found`, 200));

    // b) Sending response
    storeStockResponse.allVendorsStoreStockResponse(res, 200, vendorStock);
  }
);

// 03) ✅ UTILS: All vendors raised cup requests
exports.projectName_Utils_All_Vendors_Cup_Stock_Requests = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor cup stock data
    const stockRequest = await CupStockRequest.find()
      .select("+requestStatus")
      .populate("vendor", "primaryEmail +name")
      .populate(
        "cupsRequested.cupID",
        "cupModelUniqueId cupType cupSize cupCapacity cupPrice currency"
      )
      .sort({ createdAt: -1 });

    // b) Checking is request exist
    if (!stockRequest || stockRequest.length === 0) {
      return next(new ErrorHandler(`No requests found.`, 200));
    }

    // c) Sending response
    storeStockResponse.storeStockRequestsResponse(
      res,
      200,
      stockRequest,
      true,
      0
    );
  }
);

// 04) ✅ UTILS: All vendors pending stock requests
exports.projectName_Utils_All_Vendor_Pending_Cup_Stock_Requests = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor cup stock data
    const stockRequest = await CupStockRequest.find({
      approvalStatus: "STATUS_PENDING",
    })
      .select("+requestStatus")
      .populate("vendor", "primaryEmail +name")
      .sort({ createdAt: -1 });

    // b) Checking if data fetched or it exist
    if (!stockRequest || stockRequest.length === 0) {
      return next(new ErrorHandler(`No pending requests found.`, 200));
    }

    // c) Sending response
    storeStockResponse.storeStockRequestsResponse(
      res,
      200,
      stockRequest,
      true,
      1
    );
  }
);

// 05) ✅ UTILS: All vendors rejected stock requests
exports.projectName_Utils_All_Vendor_Rejected_Cup_Stock_Requests = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor cup stock data
    const stockRequest = await CupStockRequest.find({
      approvalStatus: "STATUS_REJECTED",
    })
      .select("+requestStatus")
      .populate("vendor", "primaryEmail +name")
      .sort({ createdAt: -1 });

    // b) Checking if data fetched or it exist
    if (!stockRequest || stockRequest.length === 0) {
      return next(new ErrorHandler(`No rejected requests found`, 200));
    }

    // c) Sending response
    storeStockResponse.storeStockRequestsResponse(
      res,
      200,
      stockRequest,
      true,
      2
    );
  }
);

// 06) ✅ UTILS: All vendors accepted stock requests
exports.projectName_Utils_All_Vendor_Accepted_Cup_Stock_Requests = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor cup stock data
    const stockRequest = await CupStockRequest.find({
      approvalStatus: "STATUS_ACCEPTED",
    })
      .select("+requestStatus")
      .populate("vendor", "primaryEmail +name")
      .sort({ createdAt: -1 });

    // b) Checking if data fetched or it exist
    if (!stockRequest || stockRequest.length === 0) {
      return next(new ErrorHandler(`No accepted requests found.`, 200));
    }

    // c) Sending response
    storeStockResponse.storeStockRequestsResponse(
      res,
      200,
      stockRequest,
      true,
      3
    );
  }
);

// 07) ✅ UTILS: Single vendor cups stock in store
exports.projectName_Utils_Single_Vendor_Store_Cup_Stock = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring id from params
    // a) Fetching vendor id
    if (req.params.id) {
      vendorID = req.params.id;
    } else {
      const vendor = await Vendors.findById({ _id: req.user.id }).select(
        "+primaryRole"
      );
      if (vendor.primaryRole.toLowerCase() === "vendor") {
        vendorID = req.user.id;
      } else {
        return next(new ErrorHandler(`Vendor not found.`, 200));
      }
    }

    // b) Fetching vendor cup stock data
    const vendor = await Vendors.findOne({
      _id: vendorID,
    }).select(
      "+name primaryEmail username profilePicture +accountActive +storeCupsStock"
    );

    // c) Checking for error
    if (!vendor) {
      return next(new ErrorHandler(`Vendor data not found`, 200));
    }
    if (!vendor.storeCupsStock || vendor.storeCupsStock.length === 0) {
      return next(new ErrorHandler(`Stock information not found`, 200));
    }

    // d) Fetching vendor stock
    const vendorStock = await StoreCupsStock.findById({
      _id: vendor.storeCupsStock,
    })
      .populate("vendor", "name primaryEmail primaryContactNumber")
      .populate("cups.cupID")
      .catch((err) => {
        return next(new ErrorHandler(`Something went wrong`, 404));
      });

    if (!vendorStock) {
      return next(new ErrorHandler(`Data not found`, 404));
    }

    // d) Sending response
    storeStockResponse.singleVendorStoreStockResponse(res, 200, vendorStock);
  }
);

// 08) ✅ UTILS: Single vendor all raised cup requests
exports.projectName_Utils_Single_Vendor_Cup_Stock_Requests = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor id
    if (req.params.id) {
      vendorID = req.params.id;
    } else {
      const vendor = await Vendors.findById({ _id: req.user.id }).select(
        "+primaryRole"
      );
      if (vendor.primaryRole.toLowerCase() === "vendor") {
        vendorID = req.user.id;
      } else {
        return next(new ErrorHandler(`Vendor not found.`, 200));
      }
    }

    // b) Fetching vendor cup stock data
    const stockRequest = await CupStockRequest.find({
      vendor: vendorID,
    })
      .select("+requestStatus +isDeliveryConfirm")
      .populate("vendor", "primaryEmail +name")
      .populate(
        "cupsRequested.cupID",
        "cupModelUniqueId cupType cupSize cupCapacity cupPrice currency"
      )
      .sort({ createdAt: -1 });

    if (!stockRequest || stockRequest.length === 0) {
      return next(new ErrorHandler(`No data found.`, 200));
    }

    // c) Sending response
    storeStockResponse.storeStockRequestsResponse(
      res,
      200,
      stockRequest,
      true,
      0
    );
  }
);

// 09) ✅ UTILS: Single vendor pending stock requests
exports.projectName_Utils_Single_Vendor_Pending_Cup_Stock_Requests = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor id
    if (req.params.id) {
      vendorID = req.params.id;
    } else {
      const vendor = await Vendors.findById({ _id: req.user.id }).select(
        "+primaryRole"
      );
      if (vendor.primaryRole.toLowerCase() === "vendor") {
        vendorID = req.user.id;
      } else {
        return next(new ErrorHandler(`Vendor not found.`, 200));
      }
    }

    // b) Fetching vendor cup stock data
    const stockRequest = await CupStockRequest.find({
      vendor: vendorID,
      approvalStatus: "STATUS_PENDING",
    })
      .select("+requestStatus")
      .populate("vendor", "primaryEmail +name")
      .sort({ createdAt: -1 });

    if (!stockRequest || stockRequest.length === 0) {
      return next(new ErrorHandler(`No pending stock request exist.`, 200));
    }

    // c) Sending response
    storeStockResponse.storeStockRequestsResponse(
      res,
      200,
      stockRequest,
      true,
      1
    );
  }
);

// 10) ✅ UTILS: Single vendor rejected stock requests
exports.projectName_Utils_Single_Vendor_Rejected_Cup_Stock_Requests =
  CatchAsync(async (req, res, next) => {
    // a) Fetching vendor id
    if (req.params.id) {
      vendorID = req.params.id;
    } else {
      const vendor = await Vendors.findById({ _id: req.user.id }).select(
        "+primaryRole"
      );
      if (vendor.primaryRole.toLowerCase() === "vendor") {
        vendorID = req.user.id;
      } else {
        return next(new ErrorHandler(`Vendor not found.`, 200));
      }
    }

    // b) Fetching vendor cup stock data
    const stockRequest = await CupStockRequest.find({
      vendor: vendorID,
      approvalStatus: "STATUS_REJECTED",
    })
      .select("+requestStatus")
      .populate("vendor", "primaryEmail +name")
      .sort({ createdAt: -1 });

    if (!stockRequest || stockRequest.length === 0) {
      return next(
        new ErrorHandler(`Single vendor stock requests not found.`, 200)
      );
    }

    // c) Sending response
    storeStockResponse.storeStockRequestsResponse(
      res,
      200,
      stockRequest,
      true,
      2
    );
  });

// 11) ✅ UTILS: Single vendor accepted stock requests
exports.projectName_Utils_Single_Vendor_Accepted_Cup_Stock_Requests =
  CatchAsync(async (req, res, next) => {
    // a) Fetching vendor id
    if (req.params.id) {
      vendorID = req.params.id;
    } else {
      const vendor = await Vendors.findById({ _id: req.user.id }).select(
        "+primaryRole"
      );
      if (vendor.primaryRole.toLowerCase() === "vendor") {
        vendorID = req.user.id;
      } else {
        return next(new ErrorHandler(`Vendor not found.`, 200));
      }
    }

    // b) Fetching vendor cup stock data
    const stockRequest = await CupStockRequest.find({
      vendor: vendorID,
      approvalStatus: "STATUS_ACCEPTED",
    })
      .select("+requestStatus")
      .populate("vendor", "primaryEmail +name")
      .sort({ createdAt: -1 });

    if (!stockRequest || stockRequest.length === 0) {
      return next(
        new ErrorHandler(`Single vendor stock requests not found.`, 200)
      );
    }

    // c) Sending response
    storeStockResponse.storeStockRequestsResponse(
      res,
      200,
      stockRequest,
      true,
      3
    );
  });

// 12) ✅ UTILS: Single stock request information
exports.projectName_Utils_Vendor_Single_Cup_Stock_Request_Information =
  CatchAsync(async (req, res, next) => {
    // a) Destructuring id from params
    const requestID = req.params.rid;

    // b) Fetching vendor cup stock data
    const stockRequest = await CupStockRequest.findById({ _id: requestID })
      .select("+requestStatus +isDeliveryConfirm")
      .populate("vendor", "primaryEmail +name")
      .populate("cupsRequested.cupID")
      .catch((err) => {
        return next(new ErrorHandler(`Something went wrong`, 404));
      });

    if (!stockRequest) {
      return next(
        new ErrorHandler(`Vendor single stock request not found`, 200)
      );
    }

    // c) Sending response
    storeStockResponse.storeStockRequestsResponse(
      res,
      200,
      stockRequest,
      false,
      0
    );
  });

// 13) ✅ UTILS: Dashboard Information for single vendor
exports.projectName_Utils_Vendor_Show_All_Information = CatchAsync(
  async (req, res, next) => {
    // Response object
    let vendorData = {
      cups: 0,
      customers: 0,
      orders: 0,
      cupRequests: 0,
      co2Savings: 0,
      singleUseCupCost: 0,
      wasteToLandfill: 0,
    };

    // Cup Data
    const tempCups = await StoreCupsStock.findOne({
      vendor: req.user.id,
    }).catch((err) => console.log("error"));

    if (!tempCups) {
      vendorData.cups = 0;
    } else if (tempCups || tempCups.length !== 0) {
      tempCups.cups.forEach((data) => {
        vendorData.cups += parseInt(data.numberOfCups);
      });
    }

    // Customers data
    const customers = await Customers.find({ isActive: true });

    // Orders data
    const orders = await CupOrders.find({ fromVendor: req.user.id });

    const cupRequests = await CupStockRequest.find({ vendor: req.user.id });

    const vendor = await Vendors.findById({ _id: req.user.id }).select(
      "+singleUseCupCost"
    );

    // Data assignment
    vendorData.customers =
      !customers || customers.length === 0 ? 0 : customers.length;
    vendorData.orders = !orders || orders.length === 0 ? 0 : orders.length;
    vendorData.cupRequests = !cupRequests ? 0 : cupRequests.length;

    if (vendorData.orders && vendorData.orders !== 0) {
      vendorData.wasteToLandfill = vendorData.orders * 0.03;
      vendorData.co2Savings = vendorData.orders * 0.104;
      if (vendor.singleUseCupCost) {
        vendorData.singleUseCupCost =
          vendor.singleUseCupCost * vendorData.orders;
      }
    }

    res.status(200).json({
      success: true,
      message: "All informtion",
      vendorData,
    });
  }
);
