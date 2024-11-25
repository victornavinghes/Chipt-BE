// BuiltIn Module Import
const OTPgenerator = require("otp-generator");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary");
const crypto = require("crypto");

// Created middleware Import
const CatchAsync = require("../../errors/catchAsync.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const sendEmail = require("../../utils/sendMails.js");
const {
  userAuthenticationResponses,
  customerResponses,
} = require("../../utils/responseObjects.js");
const authToken = require("../../utils/authToken.js");
const projectValidation = require("../../utils/validations.js");
const utilsMiddleware = require("../utilController/utilsMiddleware.js");
const ApiFeatures = require("../../utils/apiFeatures.js");

// Database Import
const Customers = require("../../models/Customer/Customer.js");
const InAppNotification = require("../../models/Notification/InAppNotification.js");
const firebaseAdmin = require("../../config/firebase/firebaseConfig.js");

/* 
    Modules Indexes
    01) Customer Sign up
    02) Customer OTP verification
    03) Customer resend OTP
    04) Customer sign in
    05) Customer sign out
    06) Customer password update
    07) Customer forgot password OTP
    08) Customer reset otp verification
    09) Customer reset password OTP
    10) Customer forgot password email
    11) Customer reset password email
    12) Customer profile information
    13) Customer first time account creation
    14) Customer profile image upload
    15) Customer profile information update
*/

// 01) ✅ CUSTOMER: SIGN UP
exports.projectName_Customer_Account_Sign_Up = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring request object
    const { countryCode, contactNumber, email, password } = req.body;
    if (!countryCode || !contactNumber || !email || !password) {
      return next(new ErrorHandler(`Please provide all details`, 401));
    }

    // b) Validating username, email, and password
    const emailValidation = projectValidation.emailValidation(req.body.email);
    if (!emailValidation.success) {
      return next(new ErrorHandler(emailValidation.message, 400));
    }
    const passwordValidation = projectValidation.passwordValidation(
      req.body.password
    );
    if (!passwordValidation.success) {
      return next(new ErrorHandler(passwordValidation.message, 400));
    }

    // c) Checking if email or username already exist
    const isContactExist =
      await utilsMiddleware.userContactExistanceNoCodeCheck(
        req.body.contactNumber
      );
    const isEmailExist = await utilsMiddleware.userEmailExistanceCheck(
      req.body.email.toLowerCase()
    );
    if (isContactExist) {
      return next(
        new ErrorHandler(`User already exist with same contact.`, 400)
      );
    }
    if (isEmailExist) {
      return next(
        new ErrorHandler(`User already exist with same email address`, 400)
      );
    }

    // d) Generating OTP for customer account
    const OTP = OTPgenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      digits: true,
      specialChars: false,
    });

    // e) Creating user account
    const customer = await Customers.create({
      accountActive: false,
      countryCode: parseInt(req.body.countryCode),
      primaryContactNumber: parseInt(req.body.contactNumber),
      primaryEmail: req.body.email.toLowerCase(),
      password: req.body.password,
      userOTP: {
        otp: OTP,
        timeToExpire: Date.now() + 960000,
        OTPVerifed: false,
      },
    });

    // f) Sending OTP to vendor
    let emailSuccess = false;
    let message = `Dear customer,\n\nGreetings of the day,\n\nYou account registration verification OTP is ${OTP}.\n\nThanks,\nChipt`;
    try {
      await sendEmail({
        email: customer.primaryEmail,
        subject: "Chipt account OTP",
        message,
      });
      emailSuccess = true;
    } catch (error) {
      emailSuccess = false;
      return next(new ErrorHandler(err.message, 500));
    }

    // g) If OTP not sent then sending error response
    if (!emailSuccess) {
      await Customers.findByIdAndDelete({ _id: customer._id });
      return next(
        new ErrorHandler(`Something went wrong while sending OTP`, 200)
      );
    } else {
      // h) Sending notification
      utilsMiddleware.sendNotificationToUser(
        false,
        "customer",
        null,
        customer._id,
        "Sign Up",
        `Account has been created, Please verify your account using OTP sent to your email.`
      );

      // i) Sending response
      authToken.userSendToken(res, 200, customer, "signup", "customer", true);
    }
  }
);

// 02) ✅ CUSTOMER: OTP VERIFICATION
exports.projectName_Customer_Account_OTP_Verification = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring logged in vendor ID and destructuring request body
    const customerID = req.user.id;
    const { otp } = req.body;

    // b) Sending error response if OTP not provided
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "Please enter your otp",
      });
    }

    // c) Fetching vendor and checking if vendor exists
    const customer = await Customers.findById({ _id: customerID }).select(
      "+accountActive +accountVerified"
    );
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer doesn't exist!`,
      });
    }

    // d) Checking if otp is expired or not
    if (customer.userOTP.OTPVerifed) {
      return res.status(200).json({
        success: true,
        message: "OTP is already Verified",
        isActive: true,
      });
    } else if (customer.userOTP.timeToExpire <= Date.now()) {
      customer.userOTP.otp = undefined;
      customer.userOTP.timeToExpire = undefined;
      customer.userOTP.OTPVerifed = false;
      return res.status(200).json({
        success: false,
        message: "OTP has been Expired, Try with new one!",
      });
    } else if (customer.userOTP.timeToExpire > Date.now()) {
      if (customer.userOTP.otp === parseInt(req.body.otp)) {
        customer.accountActive = true;
        customer.accountVerified = true;
        customer.userOTP.otp = undefined;
        customer.userOTP.timeToExpire = undefined;
        customer.userOTP.OTPVerifed = true;
        await customer.save();
        // d.4) Sending notification
        utilsMiddleware.sendNotificationToUser(
          false,
          "customer",
          null,
          customer._id,
          "Account verification",
          `Your account has been verified!`
        );
        return res.status(200).json({
          success: true,
          message: "OTP Verified",
          isActive: true,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: "Wrong OTP provided",
          isActive: true,
        });
      }
    }
  }
);

// 03) ✅ CUSTOMER: RESEND OTP
exports.projectName_Customer_Account_Resend_OTP = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring logged in vendor ID and destructuring request body
    const customerID = req.user.id;

    // b) Fetching vendor and checking if vendor exists
    const customer = await Customers.findById({ _id: customerID }).select(
      "+accountActive +accountVerified firstname primaryEmail"
    );
    if (!customer) {
      return next(new ErrorHandler("No such Vendor found!", 404));
    }

    // c) Generating OTP for customer account
    const OTP = OTPgenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      digits: true,
      specialChars: false,
    });

    // d) Sending OTP to vendor
    let emailSuccess = false;
    let message = `Dear customer,\n\nGreeting of the day,\n\nPlease use this OTP ${OTP} for verification.\n\nThanks,\nChipt`;
    try {
      await sendEmail({
        email: customer.primaryEmail,
        subject: "Chipt account OTP",
        message,
      });
      emailSuccess = true;
      customer.userOTP.otp = OTP;
      customer.userOTP.timeToExpire = Date.now() + +960000;
      customer.userOTP.OTPVerifed = false;
      await customer.save();
    } catch (err) {
      emailSuccess = false;
      return next(new ErrorHandler(err.message, 500));
    }

    // e) If OTP not sent then sending error response
    if (!emailSuccess) {
      customer.userOTP.otp = undefined;
      customer.userOTP.timeToExpire = undefined;
      customer.userOTP.OTPVerifed = undefined;
      await customer.save();
      return next(
        new ErrorHandler(`Something went wrong while sending OTP`, 404)
      );
    }

    // f) Sending notificarion
    utilsMiddleware.sendNotificationToUser(
      false,
      "customer",
      null,
      customer._id,
      "Resend OTP",
      `Account verification OTP sent to your email!`
    );
    // g) Sending response
    authToken.userSendToken(res, 200, customer, "signup", "customer", true);
  }
);

exports.projectName_Customer_Firebase_Auth = CatchAsync(
  async (req, res, next) => {
    const { token, countryCode } = req.body;

    if (!token) {
      return next(new ErrorHandler("Token is required", 400));
    }

    if (!countryCode) {
      return next(new ErrorHandler("Country code is required", 400));
    }

    try {
      // Verify the token with Firebase Admin
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      const phoneNumber = decodedToken.phone_number;

      if (!phoneNumber) {
        return next(new ErrorHandler("Invalid token", 400));
      }

      const contactNumber = phoneNumber.replace(countryCode, "");

      // console.log("countryCode", countryCode);
      // console.log("contactNumber", contactNumber);

      // Check if the customer exists in the database
      const customer = await Customers.findOne({
        primaryContactNumber: parseInt(contactNumber),
        countryCode: parseInt(countryCode),
      }).select(
        "+isBlocked profilePicture name primaryEmail primaryContactNumber countryCode"
      );

      if (!customer) {
        return res.status(200).json({
          success: false,
          customerNotFound: true,
          message: "Customer does not exist",
        });
      }

      if (customer.isBlocked) {
        return res.status(200).json({
          success: false,
          blocked: true,
          message: "Customer account is blocked",
        });
      }

      console.log("customer", customer);

      // Sign in the customer
      authToken.userSendToken(res, 200, customer, "login", "customer");
    } catch (error) {
      return next(new ErrorHandler("Invalid token", 400));
    }
  }
);

exports.projectName_Customer_Auth_Sign_Up = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring request object
    const { countryCode, phoneNumber, name } = req.body;
    if (!countryCode || !phoneNumber || !name) {
      return next(new ErrorHandler(`Please provide all details`, 401));
    }

    // b) Checking if phone number already exists
    const isContactExist =
      await utilsMiddleware.userContactExistanceNoCodeCheck(phoneNumber);
    if (isContactExist) {
      return next(
        new ErrorHandler(
          `User already exists with the same contact number.`,
          400
        )
      );
    }

    // c) Creating user account
    const customer = await Customers.create({
      accountActive: true,
      countryCode: parseInt(countryCode),
      primaryContactNumber: parseInt(phoneNumber),
      name: name.toLowerCase(),
    });

    // d) Sending response
    authToken.userSendToken(res, 200, customer, "signup", "customer");
  }
);

// 04) ✅ CUSTOMER: SIGN IN
exports.projectName_Customer_Account_Sign_In = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring the data from request body
    const { contactNumber, password } = req.body;

    // b) Checking if email and password
    if (!contactNumber || !password) {
      return next(new ErrorHandler(`Please enter email and password`, 400));
    }

    // b) Checking if user exist
    const customerExist =
      (await Customers.findOne({
        primaryEmail: contactNumber.toString(),
      }).select(
        "+accountActive +isBlocked +password +firstname +middlename +lastname"
      )) ||
      (await Customers.findOne({
        primaryContactNumber: parseInt(contactNumber),
      }).select(
        "+accountActive +isBlocked +password +firstname +middlename +lastname"
      ));

    // c.1) Checking if account is active
    if (customerExist.isBlocked) {
      return next(
        new ErrorHandler(
          "Dear user, your account has been suspended by admin!",
          403
        )
      );
    }

    // c.2) Checking password are same or not
    if (
      !customerExist ||
      !(await customerExist.correctPassword(password, customerExist.password))
    ) {
      return next(new ErrorHandler("Invalid Credential", 401));
    }

    // d) Fetching User data
    const customer = await Customers.findById({
      _id: customerExist._id,
    }).select("+accountActive +alleyAuth userName email OTPVerified");

    // e) Setting cookie and sending response
    authToken.userSendToken(res, 200, customer, "login", "customer");
  }
);

// 05) ✅ CUSTOMER: SIGN OUT
exports.projectName_Customer_Account_Sign_Out = CatchAsync(
  async (req, res, next) => {
    // a) Setting null value for header authorization and cookie
    req.headers.authorization = null;
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    // b) Sending response
    res.status(200).json({
      success: true,
      message: "You are logged out.",
    });
  }
);

// 06) ✅ CUSTOMER: PASSWORD UPDATE
exports.projectName_Customer_Account_Password_Update = CatchAsync(
  async (req, res, next) => {
    // a) Extracting customer id from logged in vendor
    const customerID = req.user.id;
    if (
      !req.body.oldPassword ||
      !req.body.newPassword ||
      !req.body.confirmPassword
    )
      return next(new ErrorHandler(`Please provide passwords`, 400));

    // b) Fetching customer details
    const customer = await Customers.findById({ _id: customerID })
      .select("+password firstname middlename lastname")
      .catch((err) => {});

    if (!customer) {
      return res.status(200).json({
        success: false,
        message:
          "Something went wrong while changing password, Please try again after sometime!",
      });
    }

    // d) Checking saved and provided password are save or not
    const ispasswordMatch = await customer.correctPassword(
      req.body.oldPassword,
      customer.password
    );
    if (!ispasswordMatch) {
      return res.status(200).json({
        success: false,
        message: "Old password is incorrect!",
      });
    }

    // e) Saving password after all validation check
    customer.password = req.body.newPassword;
    await customer.save();

    // f) Sending cookie and response
    utilsMiddleware.sendNotificationToUser(
      false,
      "customer",
      null,
      customer._id,
      "Password update",
      `Account password has been updated.`
    );
    authToken.userSendToken(res, 200, customer, "passwordupdate", "customer");
  }
);

// 07) ✅ CUSTOMER: FORGOT PASSWORD USING OTP
exports.projectName_Customer_Account_Password_Forgot_OTP = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring request body and checking if email provided
    const { email } = req.body;

    if (!email) {
      return next(
        new ErrorHandler(`Please provide your registered Email`, 401)
      );
    }

    // b) Fetching vendor and checking if vendor exist
    const customer = await Customers.findOne({
      primaryEmail: req.body.email.toLowerCase(),
    }).select("primaryEmail +firstname +middlename +lastname");

    if (!customer) {
      return res.status(200).json({
        success: false,
        message: "No user exist by the given email address",
      });
    }

    // c) OTP generation
    const otp = OTPgenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // e) Saving OTP in vendor record and sending success response
    customer.forgotOTP.otp = otp;
    customer.forgotOTP.OTPVerifed = false;
    customer.timeToExpire = Date.now() + 960000;
    customer.resetPasswordToken = undefined;
    customer.resetPasswordTokenExpire = undefined;
    await customer.save();

    // d) Sending email to vendor and if it fail sending error response
    let emailSend = false;
    const message = `Dear customer,\n\nGreeting of the day.\n\nYour account reset verification OTP is ${otp}, Please use this otp before ${
      Date.now() + 960000
    } otherwise it will expire. \n\n If you have not request this email then please ignore this!\n\nThanks\nChipt`;
    await sendEmail({
      email: req.body.email,
      subject: "Chipt Account Password Reset",
      message,
    })
      .then(() => (emailSend = true))
      .catch(() => (emailSend = false));

    if (!emailSend) {
      customer.forgotOTP.otp = undefined;
      customer.forgotOTP.OTPVerifed = false;
      customer.timeToExpire = undefined;
      customer.resetPasswordToken = undefined;
      customer.resetPasswordTokenExpire = undefined;
      await customer.save();
      return next(
        new ErrorHandler("Something went wrong while sending the mail!", 500)
      );
    }

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}`,
    });
  }
);

// 08) ✅ CUSTOMER: RESET OTP VERIFICATION
exports.projectName_Customer_Account_Reset_OTP_Verification = CatchAsync(
  async (req, res, next) => {
    // a) Destructuting request body and checking it they are provided
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(
        new ErrorHandler(`Please provide Email and OTP for verification!`, 400)
      );
    }

    // b) Fetching Vendor and checking if they exist
    const customer = await Customers.findOne({
      primaryEmail: req.body.email.toLowerCase(),
    });
    if (!customer) {
      return res.status(200).json({
        success: false,
        message: `No such customer exist by this email`,
      });
    }

    // c) Verifying if saved and proided OTP are same
    if (customer.forgotOTP.otp !== parseInt(req.body.otp)) {
      return res.status(200).json({
        success: false,
        message: `OTP does not match`,
      });
    }

    if (customer.forgotOTP.timeToExpire <= Date.now()) {
      customer.forgotOTP.otp = undefined;
      customer.forgotOTP.timeToExpire = undefined;
      customer.forgotOTP.OTPVerifed = false;
      return next(new ErrorHandler(`OTP has been expired`, 403));
    }

    customer.forgotOTP.otp = undefined;
    customer.forgotOTP.timeToExpire = undefined;
    customer.forgotOTP.OTPVerifed = true;
    await customer.save();

    res.status(200).json({
      success: true,
      message: `OTP verified successfully`,
    });
  }
);

// 09) ✅ CUSTOMER: RESET PASSWORD USING OTP
exports.projectName_Customer_Account_Password_Reset_After_OTP_Verified =
  CatchAsync(async (req, res, next) => {
    // a) Destructuring request body and checking for all fields required
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all details",
      });
    }
    const passwordValidation = projectValidation.passwordValidation(
      req.body.newPassword
    );
    if (!passwordValidation.success) {
      return res.status(400).json({
        success: false,
        message: `${passwordValidation.message}`,
      });
    }

    // b) Fetching vendor details and checking if they exist
    const customer = await Customers.findOne({
      primaryEmail: req.body.email.toLowerCase(),
    });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No such customer exists",
      });
    }

    // c) Checking if OTP is verified and if new and confirm password are same
    if (!customer.forgotOTP.OTPVerifed) {
      return res.status(400).json({
        success: false,
        message: `OTP is not verified, Please try again after some time!`,
      });
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(404).json({
        success: false,
        message: "Passwords doesn't match.",
      });
    }

    // d) Saving password and other details
    customer.password = req.body.newPassword;
    customer.forgotOTP.otp = undefined;
    customer.forgotOTP.timeToExpire = undefined;
    customer.forgotOTP.OTPVerifed = undefined;
    (customer.resetPasswordToken = undefined),
      (customer.resetPasswordExpire = undefined);
    await customer.save();

    // e) Sending response
    utilsMiddleware.sendNotificationToUser(
      false,
      "customer",
      null,
      customer._id,
      "Sign Up",
      `Account password has been reset.`
    );
    userAuthenticationResponses.userPasswordResetResponse(res, 200, "customer");
  });

// 10) ✅ CUSTOMER: FORGOT PASSWORD USING EMAIL
exports.projectName_Customer_Account_Password_Forgot_Email = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring request body and checking if data are provided
    const { email } = req.body;
    if (!email) {
      return next(
        new ErrorHandler("Please enter your registered Email address!", 400)
      );
    }

    // b) Fetching user and checking if vendor exist
    const customer = await Customers.findOne({
      primaryEmail: req.body.email.toLowerCase(),
    }).select("primaryEmail +firstname");
    if (!customer) {
      return next(
        new ErrorHandler(`No such vendor exist with this email!`, 200)
      );
    }

    // c) Get ResetPasswordToken
    const resetToken = await customer.getResetPasswordToken();
    customer.forgotOTP.otp = undefined;
    customer.forgotOTP.timeToExpire = undefined;
    await customer.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/customer/authentication/password/reset/email/${resetToken}`;

    // d) Sending email to vendor and if it fail sending error response
    let emailSend = false;
    const message = `Dear ${
      customer.firstname ? customer.firstname : "Customer"
    },\n\nGreetings of the day,\n\nYour account password reset url is:- \n\n ${resetPasswordUrl}, \n\nIf you have not request this email then please ignore it.\n\nThanks\nChipt`;
    await sendEmail({
      email: customer.primaryEmail,
      subject: "Chipt Account Password Reset",
      message,
    })
      .then(() => (emailSend = true))
      .catch(() => (emailSend = false));

    if (!emailSend) {
      (customer.resetPasswordToken = undefined),
        (customer.resetPasswordTokenExpire = Date.now());
      await customer.save();
      return next(
        new ErrorHandler("Something went wrong while sending the mail!", 500)
      );
    }

    // e) Sending response on email success
    res.status(200).json({
      success: true,
      message: `Reset email sent to ${customer.primaryEmail}`,
    });
  }
);

// 11) ✅ CUSTOMER: RESET PASSWORD USING EMAIL
exports.projectName_Customer_Account_Password_Reset_Email = CatchAsync(
  async (req, res, next) => {
    // a) Creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // b) Validating password
    if (!req.body.newPassword || !req.body.confirmPassword) {
      return next(new ErrorHandler("Please provide passwords.", 404));
    }
    const passwordValidation = projectValidation.passwordValidation(
      req.body.newPassword
    );
    if (!passwordValidation.success)
      return next(new ErrorHandler(`${passwordValidation.message}`, 400));

    // c) Fetching vendor using reset token
    const customer = await Customers.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    // d) Checking if vendor exist and if new and confirm passwords are same
    if (!customer) {
      return next(
        new ErrorHandler(
          "Reset password token is invalid or has been expired.",
          404
        )
      );
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("Passwords doesn't match.", 404));
    }

    // e) Saving password and other details
    customer.password = req.body.newPassword;
    customer.forgotOTP.otp = undefined;
    customer.forgotOTP.timeToExpire = undefined;
    (customer.resetPasswordToken = undefined),
      (customer.resetPasswordExpire = undefined);
    await customer.save();

    // f) Sending response
    utilsMiddleware.sendNotificationToUser(
      false,
      "customer",
      null,
      customer._id,
      "Account recovery",
      `Account has been recovered successfully.`
    );
    userAuthenticationResponses.userPasswordResetResponse(res, 200, "customer");
  }
);

// 12) ✅ CUSTOMER: PROFILE INFORMATION
exports.projectName_Customer_Account_Informations = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor ID from loggin vendor
    const customerID = req.user.id;

    // b) Fetching vendor details and checking if it exist
    const customer = await Customers.findById({ _id: customerID }).select(
      "+accountActive +accountVerified username +firstname +middlename +lastname +dateOfBirth profilePicture primaryEmail +gender countryCode primaryContactNumber +plotnumber +address +city +state +country +zipCode location"
    );
    if (!customer) {
      return next(new ErrorHandler("No customer information found.", 404));
    }

    // c) Sending response
    customerResponses.customerProfileInformation(res, 200, customer);
  }
);

// 13) ✅ CUSTOMER: Username, email, contact number update
exports.projectName_Customer_Account_Contact_Update = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor ID from loggin vendor
    const customerID = req.user.id;

    // b) Fetching vendor details and checking if it exist
    const customer = await Customers.findById({ _id: customerID }).select(
      "+accountActive +accountVerified username +firstname +middlename +lastname +dateOfBirth profilePicture primaryEmail +gender countryCode primaryContactNumber +plotnumber +address +city +state +country +zipCode location"
    );

    // c) Username Check
    if (req.body.username) {
      if (req.body.username !== customer.username) {
        const usernameValidation = projectValidation.usernameValidation(
          req.body.username
        );
        if (!usernameValidation.success) {
          return res.status(200).json({
            success: false,
            message: usernameValidation.message,
          });
          // return next(new ErrorHandler(`${usernameValidation.message}`, 200));
        }
        const usernameCheck = await utilsMiddleware.userUsernameExistanceCheck(
          req.body.username
        );
        if (usernameCheck) {
          return res.status(200).json({
            success: false,
            message: `User with this ${req.body.username} username has been registered before`,
          });
          // return next(new ErrorHandler(`User with this ${req.body.username} username has been registered before`, 409))
        }
      }
    }

    // d) Email Check
    if (req.body.email) {
      if (
        req.body.email.toLowerCase() !== customer.primaryEmail.toLowerCase()
      ) {
        const emailValidation = projectValidation.emailValidation(
          req.body.email.toLowerCase()
        );
        if (!emailValidation.success) {
          return next(new ErrorHandler(`${emailValidation.message}`, 400));
        }
        const emailCheck = await utilsMiddleware.userEmailExistanceCheck(
          req.body.email.toLowerCase()
        );
        if (emailCheck) {
          return next(
            new ErrorHandler(
              `User with this ${req.body.email} address has been registered before`,
              409
            )
          );
        }
      }
    }

    // e) Contact Check
    if (req.body.contact && req.body.countryCode) {
      if (customer.countryCode && customer.primaryContactNumber) {
        if (
          req.body.countryCode !== customer.countryCode.toString() &&
          req.body.contact.toString() !==
            customer.primaryContactNumber.toString()
        ) {
          const contactCheck = await utilsMiddleware.userContactExistanceCheck(
            req.body.countryCode,
            req.body.contact
          );
          if (contactCheck) {
            return next(
              new ErrorHandler(
                `User with this ${req.body.contact} contact has been registered before`,
                409
              )
            );
          }
        }
      } else {
        const contactCheck = await utilsMiddleware.userContactExistanceCheck(
          req.body.countryCode,
          req.body.contact
        );
        if (contactCheck) {
          return next(
            new ErrorHandler(
              `User with this ${req.body.contact} contact has been registered before`,
              409
            )
          );
        }
      }
    }

    // f) Saving information
    customer.username = req.body.username
      ? req.body.username.toLowerCase()
      : customer.username.toLowerCase();
    customer.primaryEmail = req.body.email
      ? req.body.email.toLowerCase()
      : customer.primaryEmail.toLowerCase();
    if (customer.countryCode && customer.primaryContactNumber) {
      customer.countryCode = req.body.countryCode
        ? req.body.countryCode
        : customer.countryCode;
      customer.primaryContactNumber = req.body.contact
        ? req.body.contact
        : customer.primaryContactNumber;
    } else {
      customer.countryCode = req.body.countryCode
        ? req.body.countryCode
        : undefined;
      customer.primaryContactNumber = req.body.contact
        ? req.body.contact
        : undefined;
    }
    await customer.save();

    // g) Sending response
    utilsMiddleware.sendNotificationToUser(
      false,
      "customer",
      null,
      customer._id,
      "Contact update",
      `Account contact information has been updated.`
    );
    customerResponses.customerProfileInformation(res, 200, customer);
  }
);

// 14) ✅ CUSTOMER: Basic information update
exports.projectName_Customer_Account_Basic_Information_Update = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor details and checking if it exist
    const customer = await Customers.findById({ _id: req.user.id }).select(
      "+accountActive +accountVerified username +firstname +middlename +lastname +dateOfBirth profilePicture primaryEmail +gender countryCode primaryContactNumber +plotnumber +address +city +state +country +zipCode location"
    );
    if (!customer) {
      return next(new ErrorHandler("No customer information found.", 404));
    }

    // b) Saving details
    customer.firstname = req.body.firstname
      ? req.body.firstname.toLowerCase()
      : customer.firstname
      ? customer.firstname.toLowerCase()
      : undefined;
    customer.middlename = req.body.middlename
      ? req.body.middlename.toLowerCase()
      : customer.middlename
      ? customer.middlename.toLowerCase()
      : undefined;
    customer.lastname = req.body.lastname
      ? req.body.lastname.toLowerCase()
      : customer.lastname
      ? customer.lastname.toLowerCase()
      : undefined;
    customer.dateOfBirth = req.body.dateOfBirth
      ? req.body.dateOfBirth
      : customer.dateOfBirth
      ? customer.dateOfBirth
      : undefined;
    customer.gender = req.body.gender
      ? req.body.gender.toLowerCase()
      : customer.gender
      ? customer.gender.toLowerCase()
      : undefined;
    await customer.save();

    // c) Sending response
    utilsMiddleware.sendNotificationToUser(
      false,
      "customer",
      null,
      customer._id,
      "Basic information update",
      `Your account baisc information has been updated.`
    );
    customerResponses.customerProfileInformation(res, 200, customer, false);
  }
);

// 15) ✅ CUSTOMER: Address update
exports.projectName_Customer_Account_Address_Update = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor ID from loggin vendor
    const customerID = req.user.id;

    // b) Fetching vendor details and checking if it exist
    const customer = await Customers.findById({ _id: customerID }).select(
      "+accountActive +accountVerified username +firstname +middlename +lastname +dateOfBirth profilePicture primaryEmail +gender countryCode primaryContactNumber +plotnumber +address +city +state +country +zipCode location"
    );
    if (!customer) {
      return next(new ErrorHandler("No customer information found.", 404));
    }

    // b) Saving details
    customer.plotnumber = req.body.plotnumber
      ? req.body.plotnumber.toLowerCase()
      : customer.plotnumber
      ? customer.plotnumber.toLowerCase()
      : undefined;
    customer.address = req.body.address
      ? req.body.address.toLowerCase()
      : customer.address
      ? customer.address.toLowerCase()
      : undefined;
    customer.city = req.body.city
      ? req.body.city.toLowerCase()
      : customer.city
      ? customer.city.toLowerCase()
      : undefined;
    customer.state = req.body.state
      ? req.body.state.toLowerCase()
      : customer.state
      ? customer.state.toLowerCase()
      : undefined;
    customer.city = req.body.city
      ? req.body.city.toLowerCase()
      : customer.city
      ? customer.city.toLowerCase()
      : undefined;
    customer.country = req.body.country
      ? req.body.country.toLowerCase()
      : customer.country
      ? customer.country.toLowerCase()
      : undefined;
    customer.zipCode = req.body.zipCode
      ? req.body.zipCode
      : customer.zipCode
      ? customer.zipCode
      : undefined;
    await customer.save();

    // c) Sending response
    utilsMiddleware.sendNotificationToUser(
      false,
      "customer",
      null,
      customer._id,
      "Address",
      `Your adddress information has been updated.`
    );
    customerResponses.customerProfileInformation(res, 200, customer);
  }
);

// 16) ✅ CUSTOMER: Location Update
exports.projectName_Customer_Account_Location_Update = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor details and checking if it exist
    const customer = await Customers.findById({ _id: customerID }).select(
      "+accountActive +accountVerified username +firstname +middlename +lastname +dateOfBirth profilePicture primaryEmail +gender countryCode primaryContactNumber +plotnumber +address +city +state +country +zipCode location"
    );
    if (!customer) {
      return next(new ErrorHandler("No customer information found.", 404));
    }

    // b) Saving details
    vendor.location.coordinates = req.body.location;
    customer.location.coordinates = req.body.location
      ? req.body.location
      : customer.location
      ? customer.location
      : null;
    await customer.save();

    // c) Sending response
    utilsMiddleware.sendNotificationToUser(
      false,
      "customer",
      null,
      customer._id,
      "Location update",
      `Your current location has been updated.`
    );
    customerResponses.customerProfileInformation(res, 200, customer);
  }
);

// 17) ✅  CUSTOMER: PROFILE IMAGE UPLOAD
exports.projectName_Customer_Account_Profile_Image_Upload = CatchAsync(
  async (req, res, next) => {
    // a) Variable declaration and fetching customerID
    let resizedImage;
    let customerID = req.user.id;

    // b) checking if the image is present or not
    if (!req.files.file)
      return next(new ErrorHandler("No image is provided.", 404));
    if (req.files.file.length > 1)
      return next(new ErrorHandler(`Please upload only single file`, 400));

    // c) Fetching customer details
    const customer = await Customers.findById({ _id: customerID }).select(
      "profilePicture username"
    );
    // d) Compressing image
    await utilsMiddleware
      .utilsUploadProfileImage(req.files.file)
      .then((data) => {
        resizedImage = data;
      });

    // e) Uploading image in database
    if (
      customer.profilePicture.public_id.toString() !== "default/user_jvowub"
    ) {
      await cloudinary.uploader.destroy(customer.profilePicture.public_id);
    }

    const myCloud = await cloudinary.v2.uploader.upload_stream(
      { folder: `customers/${customer._id}/profilePicture` },
      async function (err, image) {
        req.body.profilePicture = {
          public_id: image.public_id,
          url: image.url,
        };

        customer.profilePicture = req.body.profilePicture;
        await customer.save();

        res.status(200).json({
          success: true,
          message: "Yeah!",
          customer,
        });
      }
    );

    // f) Saving data using stream
    utilsMiddleware.sendNotificationToUser(
      false,
      "customer",
      null,
      customer._id,
      "Profile image updated",
      `Your profile picture has been updated successfully!.`
    );
    await streamifier.createReadStream(resizedImage.data).pipe(myCloud);
  }
);

// 18) ✅  CUSTOMER: Profile Image Delete
exports.projectName_Customer_Account_Profile_Image_Delete = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor ID
    let customerID = req.user.id;

    // b) Fetching vendor details
    const customer = await Customers.findById({ _id: customerID }).select(
      "profilePicture"
    );

    if (!customer.profilePicture) {
      return next(new ErrorHandler("No image found", 200));
    }

    // c) Checking for default image data
    if (
      customer.profilePicture.public_id.toString() === "default/user_jvowub"
    ) {
      return res.status(200).json({
        success: true,
        message: "No Image uploaded",
      });
    }

    // d) Destroying cloudinary image and setting default image in profile
    const publicID = customer.profilePicture.public_id;
    await cloudinary.uploader.destroy(publicID);
    customer.profilePicture = {
      public_id: "default/user_jvowub",
      url: "https://res.cloudinary.com/dl0p1krhq/image/upload/v1706509827/default/user_jvowub.png",
    };
    await customer.save();

    // e) Sending response
    utilsMiddleware.sendNotificationToUser(
      false,
      "customer",
      null,
      customer._id,
      "Profile image delete",
      `Your profile picture has been deleted successfully!.`
    );
    res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
    });
  }
);

// 19) ✅  CUSTOMER: Profile Image
exports.projectName_Customer_Account_Profile_Image = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor ID
    let customerID = req.user.id;

    // b) Fetching vendor details
    const customer = await Customers.findById({ _id: customerID }).select(
      "profilePicture username primaryContactNumber"
    );

    if (!customer.profilePicture) {
      return next(new ErrorHandler("No image found", 200));
    }

    const responseData = {
      _id: customer._id,
      profilePicture: customer.profilePicture,
      username: customer.username,
      contact: customer.primaryContactNumber,
    };

    // e) Sending response
    res.status(200).json({
      success: true,
      message: "Customer profile image",
      customer: responseData,
    });
  }
);

// 20) ✅ Fetching notifications
exports.projectName_Customer_Account_Notification = CatchAsync(
  async (req, res, next) => {
    // Destructuring data
    const customerID = req.user.id;
    const resultPerPage = 10;
    let queryData = req.query.rdnid;

    if (queryData) {
      console.log("yes");
      const l1 = await InAppNotification.findByIdAndUpdate(
        { _id: queryData },
        { messageRead: true }
      ).catch((err) => {
        queryData = false;
      });
    }
    const notificationCount = await InAppNotification.countDocuments({
      toCustomer: customerID,
      messageRead: false,
    });

    // Data count for frontend to show
    const apiFeature = new ApiFeatures(
      InAppNotification.find({ toCustomer: customerID, messageRead: false })
        .populate("toCustomer", "+firstname profilePicture")
        .populate("sentAdmin", "+name profilePicture")
        .populate("sentVendor", "+name profilePicture")
        .sort({ createdAt: -1 }),
      req.query
    ).pagination(resultPerPage);
    const allNotification = await apiFeature.query;

    if (!allNotification || allNotification.length < 1) {
      return res.status(200).json({
        success: false,
        message: "No notification found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor notification",
      totalNotifications: queryData ? notificationCount : notificationCount,
      currentLength: req.query.page
        ? req.query.page * resultPerPage -
          (resultPerPage - allNotification.length)
        : allNotification.length,
      allNotification,
    });
  }
);

// 22) Fetching Account Status
exports.projectName_Customer_Account_Status = CatchAsync(
  async (req, res, next) => {
    const customerID = req.user.id;
    const customer = await Customers.findById(customerID).select(
      "+accountVerified"
    );
    if (customer.accountVerified) {
      return res.status(200).json({
        success: true,
        message: "Account Verified",
        isVerified: true,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Account Not Verified",
        isAuthenticated: true,
        isVerified: false,
      });
    }
  }
);
