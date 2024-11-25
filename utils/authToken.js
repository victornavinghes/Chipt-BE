// Builtin Modules Import
const jwt = require("jsonwebtoken");

// Created middleware Import
const ErrorHandler = require("./errorHandler");
const { userAuthenticationResponses } = require("./responseObjects.js");

// Database Import
const Admin = require("../models/Admin/Admin.js");
const Vendors = require("../models/Vendors/Vendor.js");
const Customers = require("../models/Customer/Customer.js");

const authToken = {
  // 01) <<<<<<<<|| TOKEN GENERATION ||>>>>>>>>
  userSignToken: function (id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  },

  // 02) <<<<<<<<|| TOKEN SETUP FOR USER ||>>>>>>>>
  userSendToken: function (
    res,
    statusCode,
    user,
    forAction,
    userCategory,
    firstTime = false
  ) {
    // a) Token Generation
    const token = this.userSignToken(user._id);

    // b) Cookie validation days setup
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      // sameSite: "none",
      // secure: true,
      httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") {
      options.sameSite = "none";
      options.secure = true;
    }

    // c) Token setting in header
    res.cookie("token", token, options);

    if (forAction === "firstLogin") {
      userAuthenticationResponses.userRegistrationResponse(
        res,
        statusCode,
        userCategory,
        token,
        user
      );
    } else if (forAction === "signup") {
      userAuthenticationResponses.userSignUpResponse(
        res,
        statusCode,
        userCategory,
        token,
        user,
        firstTime
      );
    } else if (forAction === "login") {
      userAuthenticationResponses.userLoginInResponse(
        res,
        statusCode,
        userCategory,
        token,
        user,
        firstTime
      );
    } else if (forAction === "passwordupdate") {
      userAuthenticationResponses.userPasswordChangeResponse(
        res,
        statusCode,
        userCategory,
        token,
        user
      );
    } else if (forAction === "passwordreset") {
      userAuthenticationResponses.userPasswordResetResponse(
        res,
        statusCode,
        userCategory,
        token,
        user
      );
    }
  },

  // 03) <<<<<<<<|| AUTHENTICATION CHECK ||>>>>>>>>
  isUserAuthenticated: async function (req, res, next) {
    // a) Fetching token
    let token;
    if (req.cookies.token) {
      token = req.cookies.token;
    } else {
      token = req.headers.authorization;
    }

    // b) Returning if no token
    if (!token) {
      return res.status(401).send(`Please login.`);
    }

    // c) Decoding user using token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user;
    let temp1 = await Admin.findById(decoded.id).select(
      "+accountActive +accountVerified +primaryRole +secondaryRole"
    );
    let temp2 = await Vendors.findById(decoded.id).select(
      "+accountActive +accountVerified +primaryRole +secondaryRole"
    );
    let temp3 = await Customers.findById(decoded.id).select(
      "+accountActive +accountVerified +primaryRole +secondaryRole"
    );
    if (temp1 && !temp2 && !temp3) {
      user = temp1;
    } else if (!temp1 && temp2 && !temp3) {
      user = temp2;
    } else if (!temp1 && !temp2 && temp3) {
      user = temp3;
    }

    // d) Setting Authenicated User
    if (!user) {
      return next(new ErrorHandler(`Please login again`, 401));
    } else if (user) {
      let temp = {
        id: user._id,
        state: user.accountActive ? true : false,
        stateStatus: user.accountVerified ? true : false,
        primaryRole: user.primaryRole,
        secondaryRole: user.secondaryRole,
      };
      req.user = temp;
    }

    // e) Calling next function
    next();
  },

  // 04) <<<<<<<<|| ACCOUNT STATUS ||>>>>>>>>
  isUserAccountActive: function (req, res, next) {
    // Checking if account is active
    if (!req.user.state) {
      return res.status(200).json({
        success: false,
        message: `Account is not active.`,
      });
    }
    next();
  },

  // 04) <<<<<<<<|| ACCOUNT VERIFICATION ||>>>>>>>>
  isUserAccountVerified: async function (req, res, next) {
    // Checking if account is verified
    if (!req.user.stateStatus) {
      return res.status(200).json({
        success: false,
        message: `Account is not active.`,
      });
    }
    next();
  },

  // 06) <<<<<<<<|| AUTHORIZED ROLE CHECKING ||>>>>>>>>
  userAuthorizedRole: function (roles) {
    return (req, res, next) => {
      if (
        roles[0].toLowerCase() !== req.user?.primaryRole.toLowerCase() ||
        roles[1].toLowerCase() !== req.user?.secondaryRole.toLowerCase()
      ) {
        return next(new ErrorHandler(`Unauthorizes access.`, 403));
      }
      next();
    };
  },

  // 07) <<<<<<<<|| CHECKING VENDOR PASSWORD UPDATE ||>>>>>>>>
  vendorPasswordUpdateChecker: async function (req, res, next) {
    const user = req.user;
    if (!user.state && !user.stateStatus) {
      return next(
        new ErrorHandler("Please update your login password first", 200)
      );
    }
    next();
  },

  // 00) <<<<<<<<|| CLEARING SENSITIVE DATA ||>>>>>>>>
  userDataClear: async function (req, res, next) {
    if (req.user) {
      (req.user.primaryRole = undefined), (req.user.secondaryRole = undefined);
    }
    next();
  },
};

module.exports = authToken;
