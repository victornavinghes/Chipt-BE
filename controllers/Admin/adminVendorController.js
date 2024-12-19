// Database import
const Vendors = require("../../models/Vendors/Vendor.js");
const StoreCupsStock = require("../../models/Vendors/StoreCupsStock.js");
const CupInventory = require("../../models/Cups/CupInventory.js");
const CupStockRequest = require("../../models/Vendors/CupStockRequest.js");

// Created module import
const CatchAsync = require("../../errors/catchAsync.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const sendEmail = require("../../utils/sendMails.js");
const utilsMiddleware = require("../utilController/utilsMiddleware.js");
const projectValidation = require("../../utils/validations.js");
const requestResponse = require("../../utils/responseObjects.js");
const {
  userAuthenticationResponses,
  adminResponses,
} = require("../../utils/responseObjects.js");
// sendNotificationToUser
/*
    Index: 
        01) Vendor registration
        02) All vendors
        03) Vendor Information 
        04) Block/Unblock vendor account
        05) Active vendor accounts
        06) Inactive vendor accounts
        07) Reject vendor request
        08) Accept vendor request
        09) Deliver vendor stock
*/

// Stock reduction function
async function reduce_stock(cid, nmber) {
  const inventoryCup = await CupInventory.findById({ _id: cid }).select(
    "+cupsAvailable"
  );
  let tempNmber = inventoryCup.cupsAvailable - nmber;
  inventoryCup.cupsAvailable = tempNmber;
  await inventoryCup.save();
}

// Stock increment function
async function increase_stock(requestedCupData) {
  const inventoryCup = await CupInventory.find().select(
    "+cupsAvailable numberOfCups"
  );
  for (let i = 0; i < requestedCupData.length; i++) {
    let rid = requestedCupData[i].cupID.toString().toUpperCase();
    for (let j = 0; j < inventoryCup.length; j++) {
      let cid = inventoryCup[j]._id.toString().toUpperCase();
      if (rid === cid) {
        inventoryCup[j].numberOfCups += parseInt(
          requestedCupData[i].numberOfCups
        );
      }
    }
  }
  await inventoryCup.save();
}

// 01) ✅ ADMIN: Vendor registration
exports.projectName_Admin_Vendor_Account_Registration = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring request body and checking for all data
    const {
      name,
      email,
      oneTimePassword,
      countryCode,
      contact,
      plotnumber,
      address,
      city,
      state,
      country,
      zipCode,
      location,
    } = req.body;
    if (
      !name ||
      !email ||
      !oneTimePassword ||
      !countryCode ||
      !contact ||
      !plotnumber ||
      !address ||
      !city ||
      !state ||
      !country ||
      !zipCode ||
      !location
    ) {
      return next(new ErrorHandler("Please fill all the required fields", 400));
    }

    // b) Converting [lat, lng] to [lng, lat]
    const [latitude, longitude] = location;
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return next(
        new ErrorHandler("Invalid latitude or longitude values", 400)
      );
    }
    const coordinates = [longitude, latitude];
    // b) Validating username, email, and password
    const emailValidation = projectValidation.emailValidation(
      req.body.email.toLowerCase()
    );
    if (!emailValidation.success) {
      return next(new ErrorHandler(`${emailValidation.message}`, 400));
    }

    const passwordValidation = projectValidation.passwordValidation(
      req.body.oneTimePassword
    );
    if (!passwordValidation.success) {
      return next(new ErrorHandler(`${passwordValidation.message}`, 400));
    }

    // c) Checking if email or contact number already exist
    if (req.body.email) {
      const emailValidation = projectValidation.emailValidation(
        req.body.email.toLowerCase()
      );
      if (!emailValidation.success) {
        return next(new ErrorHandler(`${emailValidation.message}`, 400));
      }
      const emCheck = await utilsMiddleware.userEmailExistanceCheck(
        req.body.email.toLowerCase()
      );
      if (emCheck) {
        return next(
          new ErrorHandler(
            `User with this ${req.body.email.toLowerCase()} address has been registered before`,
            409
          )
        );
      }
    }

    if (req.body.contact) {
      const cnCheck = await utilsMiddleware.userContactExistanceCheck(
        req.body.countryCode,
        req.body.contact
      );

      if (cnCheck) {
        return next(
          new ErrorHandler(
            `Contact number already in use by other user, Try new one.`,
            409
          )
        );
      }
    }

    // d) Generation unique registration ID for vendor store
    let registrationID = utilsMiddleware.generateUniqueIDForVendors();
    let uniqueID = false;
    while (!uniqueID) {
      const vendor = await Vendors.findOne({ registrationID: registrationID });
      if (vendor) {
        uniqueID = false;
        registrationID = utilsMiddleware.generateUniqueIDForVendors();
      } else {
        uniqueID = true;
        registrationID = "CHIPT" + registrationID.toUpperCase();
      }
    }
    let uniqueUsername = utilsMiddleware.generateUniqueUsernameForVendors();
    let uniqueUN = false;
    while (!uniqueUN) {
      const vendor = await Vendors.findOne({ registrationID: registrationID });
      if (vendor) {
        uniqueUN = false;
        registrationID = utilsMiddleware.generateUniqueIDForVendors();
      } else {
        uniqueUN = true;
        uniqueUsername = "vendor_" + uniqueUsername.toUpperCase();
      }
    }

    // e) Creating admin account
    const vendor = await Vendors.create({
      registrationID: registrationID,
      username: uniqueUsername.toLowerCase(),
      name: req.body.name.toLowerCase(),
      primaryEmail: req.body.email.toLowerCase(),
      oneTimePassword: req.body.oneTimePassword,
      countryCode: req.body.countryCode,
      primaryContactNumber: req.body.contact,
      dateOfRegistration: Date.now(),
      plotnumber: req.body.plotnumber,
      address: req.body.address.toLowerCase(),
      city: req.body.city.toLowerCase(),
      state: req.body.state.toLowerCase(),
      country: req.body.country.toLowerCase(),
      zipCode: parseInt(req.body.zipCode),
      location: {
        type: "Point",
        coordinates: coordinates,
      },
    });
    if (!vendor) {
      return next(new ErrorHandler("Something went wrong", 500));
    }

    // f) Sending mail to vendor
    let emailSuccess = false;
    let message = `Dear Vendor,\n\nYou store registration is successful and your store registration ID is ${registrationID}. Use below credential for first time login and after successful login do change you login password. \n\nOne time credential is:\nEmail: ${req.body.email}\nPassword: ${req.body.oneTimePassword}\n\nBest of Luck!\n\nThanks\nChipt`;

    await sendEmail({
      email: req.body.email,
      subject: "Store registration",
      message,
    })
      .then(() => {
        emailSuccess = true;
      })
      .catch((err) => {
        emailSuccess = false;
      });

    // g) If email not sent then sending error response
    if (!emailSuccess) {
      await Vendors.findByIdAndDelete({ _id: vendor._id }).catch((err) => {
        return next(new ErrorHandler(`Something went wrong`, 200));
      });
      return next(
        new ErrorHandler(`Something went wrong while sending email`, 404)
      );
    }

    utilsMiddleware.sendNotificationToUser(
      "admin",
      "vendor",
      req.user.id,
      vendor._id,
      "Account creation",
      `${
        req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1)
      } account has beend created.`
    );

    res.status(200).json({
      success: true,
      message: `Vendor Registration successful`,
    });
  }
);

// 02) ✅ ADMIN: All vendors
exports.projectName_Admin_All_Vendors_List = CatchAsync(
  async (req, res, next) => {
    // a) Fetching all vendors
    const vendor = await Vendors.find().select(
      "name username primaryEmail +countryCode +primaryContactNumber profilePicture +accountActive +accountVerified +plotnumber +address +city +state +country +zipCode"
    );
    if (vendor.length === 0) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // b) Sending response
    const isList = true;
    adminResponses.registeredVendorAccountResponse(res, 200, vendor, isList);
  }
);

// 03) ✅ ADMIN: Vendor Information
exports.projectName_Admin_Single_Vendor_Information = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring id from params
    const vendorID = req.params.id;

    // b) Fetching all vendors
    const vendor = await Vendors.findById({ _id: vendorID })
      .select(
        "+registrationID +name primaryEmail username +countryCode +primaryContactNumber profilePicture +accountActive +plotnumber +address +city +state +country +zipCode location name"
      )
      .catch((err) => {
        return next(new ErrorHandler(`Something went wrong`, 200));
      });
    if (!vendor) {
      return next(new ErrorHandler(`Vendor not found`, 200));
    }

    console.log(vendor);
    userAuthenticationResponses.userProfileInformationResponse(
      res,
      200,
      "vendor",
      vendor
    );
  }
);

// 04) ✅ ADMIN: Block/Unblock vendor account
exports.projectName_Admin_Vendor_Account_Enable_Disable = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor cup stock data
    const vendor = await Vendors.findById({ _id: req.params.id })
      .select("+accountActive +accountVerified")
      .catch((err) => {
        return next(new ErrorHandler(`Something went wrong`, 200));
      });

    // b) Checking for errors
    if (!vendor) {
      return next(new ErrorHandler(`No vendors data found`, 404));
    }
    if (!vendor.accountVerified) {
      return next(
        new ErrorHandler(
          `Not allowed to block as it's account is not verified`,
          400
        )
      );
    }

    if (vendor.accountActive) vendor.accountActive = false;
    else if (!vendor.accountActive) vendor.accountActive = true;
    await vendor.save();

    // c) Sending response
    res.status(200).json({
      success: true,
      message: `Vendor account is now ${
        vendor.accountActive ? "active." : "inactive."
      }`,
    });
  }
);

// 05) ✅ ADMIN: Active vendor accounts
exports.projectName_Admin_All_Active_Vendors_Accounts = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor cup stock data
    const vendors = await Vendors.find({
      accountActive: true,
    })
      .select("name primaryEmail username profilePicture +accountActive")
      .sort({ createdAt: -1 });

    // b) Checking for errors
    if (!vendors || vendors.length === 0) {
      return next(new ErrorHandler(`No active vendors exist`, 200));
    }

    // c) Sending response
    res.status(200).json({
      success: true,
      message: "Active vendors",
      vendors,
    });
  }
);

// 06) ✅ ADMIN: Inactive vendor accounts
exports.projectName_Admin_All_Inactive_Vendors_Accounts = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor cup stock data
    const vendors = await Vendors.find({
      accountActive: false,
    })
      .select("name primaryEmail username profilePicture +accountActive")
      .sort({ createdAt: -1 });

    // b) Checking for errors
    if (!vendors || vendors.length === 0) {
      return next(new ErrorHandler(`No inactive vendors exist`, 200));
    }

    // c) Sending response
    res.status(200).json({
      success: true,
      message: "Inactive vendors",
      vendors,
    });
  }
);

// 07) ADMIN: Reject vendor request
exports.projectName_Admin_Reject_Vendor_Stock_Request = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor cup stock data
    const requestID = req.params.rid;

    // b) Fetching Information
    const cupRequest = await CupStockRequest.findById({ _id: requestID })
      .select("+requestStatus")
      .catch((err) => {
        return next(new ErrorHandler(`Something went wrong`, 404));
      });
    if (!cupRequest) {
      return next(new ErrorHandler(`No cup stock request exist`, 200));
    }

    // c) Changing status to rejected
    if (
      cupRequest.approvalStatus === "STATUS_ACCEPTED" &&
      cupRequest.requestStatus === "DISPATCH"
    ) {
      return next(new ErrorHandler(`Request already been accepted.`, 200));
    }
    if (
      cupRequest.approvalStatus === "STATUS_REJECTED" &&
      cupRequest.requestStatus === "REJECTED"
    ) {
      return next(new ErrorHandler(`Request already been rejected.`, 200));
    }
    if (
      cupRequest.approvalStatus === "STATUS_ACCEPTED" &&
      cupRequest.requestStatus === "DELIVERED"
    ) {
      return next(new ErrorHandler(`Stock already been delivered.`, 200));
    }

    const requestedCupData = cupRequest.cupsRequested;
    const inventoryCup = await CupInventory.find().select(
      "+cupsAvailable numberOfCups"
    );
    for (let i = 0; i < requestedCupData.length; i++) {
      let rid = requestedCupData[i].cupID.toString().toUpperCase();
      for (let j = 0; j < inventoryCup.length; j++) {
        let cid = inventoryCup[j]._id.toString().toUpperCase();
        if (rid === cid) {
          inventoryCup[j].numberOfCups += parseInt(
            requestedCupData[i].numberOfCups
          );
        }
      }
    }
    for (let i = 0; i < inventoryCup.length; i++) {
      const le = await CupInventory.findByIdAndUpdate(
        { _id: inventoryCup[i]._id },
        { numberOfCups: inventoryCup[i].numberOfCups },
        { new: true }
      );
    }
    cupRequest.approvalStatus = "STATUS_REJECTED";
    cupRequest.requestStatus = "REJECTED";
    await cupRequest.save();
    utilsMiddleware.sendNotificationToUser(
      "admin",
      "vendor",
      req.user.id,
      cupRequest.vendor._id,
      "Stock rejection",
      `Dear vendor, Your stock request (ID: ${req.params.rid}) has been rejected by Admin.`
    );

    // d) Sending request
    res.status(200).json({
      success: true,
      message: `Stock rejected`,
    });
  }
);

// 08) ADMIN: Accept vendor request
exports.projectName_Admin_Accept_Vendor_Stock_Request = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor cup stock data
    const requestID = req.params.rid;

    // b) Fetching Information
    const cupRequest = await CupStockRequest.findById({ _id: requestID })
      .select("+requestStatus")
      .catch((err) => {
        return next(new ErrorHandler(`Something went wrong`, 404));
      });
    if (!cupRequest) {
      return next(new ErrorHandler(`No cup stock request exist`, 200));
    }

    // c) Checking if request is already been rejected
    if (
      (cupRequest.approvalStatus === "STATUS_ACCEPTED" &&
        cupRequest.requestStatus === "DISPATCH") ||
      (cupRequest.approvalStatus === "STATUS_ACCEPTED" &&
        cupRequest.requestStatus === "SHIPPED")
    ) {
      return next(new ErrorHandler(`Request already been accepted.`, 200));
    }
    if (
      cupRequest.approvalStatus === "STATUS_REJECTED" &&
      cupRequest.requestStatus === "REJECTED"
    ) {
      return next(new ErrorHandler(`Request already been rejected.`, 200));
    }
    if (
      cupRequest.approvalStatus === "STATUS_ACCEPTED" &&
      cupRequest.requestStatus === "DELIVERED"
    ) {
      return next(new ErrorHandler(`Stock already delivered.`, 200));
    }

    for (let i = 0; i < cupRequest.cupsRequested.length; i++) {
      reduce_stock(
        cupRequest.cupsRequested[i].cupID._id,
        cupRequest.cupsRequested[i].numberOfCups
      );
    }
    // d) Changin order status
    cupRequest.approvalStatus = "STATUS_ACCEPTED";
    cupRequest.requestStatus = "SHIPPED";
    await cupRequest.save();
    // utilsMiddleware.sendNotificationToUser('admin', 'vendor', req.user.id, cupRequest.vendor._id, 'Stock request accepted', `Dear ${req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1)}, Your stock request (ID: ${req.params.rid}) has been accepted by Admin.`);

    // d) Sending request
    res.status(200).json({
      success: true,
      message: `Stock accepted`,
    });
  }
);

// 09) ADMIN: Deliver vendor stock
exports.projectName_Admin_Confirm_Delivery_Vendor_Store_Stock = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring request ID from params
    const stockRequestId = req.params.rid;

    // b) Fetching cup request
    const cupRequest = await CupStockRequest.findById({ _id: stockRequestId })
      .select("+requestStatus")
      .populate("vendor", "name primaryEmail")
      .catch((err) => {
        return next(new ErrorHandler(`Something went wrong`, 404));
      });
    if (!cupRequest) {
      return next(new ErrorHandler(`No cup stock request exist`, 200));
    }

    // c) Checking if requests is pending or dispatched or rejected
    if (
      cupRequest.approvalStatus === "STATUS_PENDING" &&
      cupRequest.requestStatus === "PROCESSING"
    ) {
      return next(
        new ErrorHandler(
          `Not allowed to update vendor stock before request approval.`,
          200
        )
      );
    }
    if (
      cupRequest.approvalStatus === "STATUS_ACCEPTED" &&
      cupRequest.requestStatus === "DISPATCH"
    ) {
      return next(
        new ErrorHandler(
          `Currently, stock can't be updated before stock approval.`,
          200
        )
      );
    }
    if (
      cupRequest.approvalStatus === "STATUS_REJECTED" &&
      cupRequest.requestStatus === "REJECTED"
    ) {
      return next(
        new ErrorHandler(`This request is already been rejected.`, 200)
      );
    }
    if (
      cupRequest.approvalStatus === "STATUS_ACCEPTED" &&
      cupRequest.requestStatus === "DELIVERED"
    ) {
      return next(
        new ErrorHandler(`Vendor stock already been delivered.`, 200)
      );
    }

    // d) Changing order status
    cupRequest.approvalStatus = "STATUS_ACCEPTED";
    cupRequest.requestStatus = "DELIVERED";
    await cupRequest.save();

    // e) Sending request
    res.status(200).json({
      success: true,
      message: `Stock delivered`,
    });
  }
);
