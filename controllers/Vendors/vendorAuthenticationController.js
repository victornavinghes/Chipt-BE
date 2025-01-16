// BuiltIn Module Import
const OTPgenerator = require("otp-generator");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary");
const crypto = require("crypto");

// Database Import
const Customer = require("../../models/Customer/Customer.js");
const Admin = require("../../models/Admin/Admin.js");
const Vendors = require("../../models/Vendors/Vendor.js");
const InAppNotification = require("../../models/Notification/InAppNotification.js");

// User Created Module Import
const CatchAsync = require("../../errors/catchAsync.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const sendEmail = require("../../utils/sendMails.js");
const utilsMiddleware = require("../utilController/utilsMiddleware.js");
const projectValidation = require("../../utils/validations.js");
const {
  userAuthenticationResponses,
} = require("../../utils/responseObjects.js");
const authToken = require("../../utils/authToken.js");

/* 
    Index: 
        01) First Login
        02) Registration OTP Verification
        03) Resend OTP
        04) Sign in
        05) Sign out
        06) Password change
        07) (OTP) Forgot password
        08) (OTP) Forgot OTP verification
        09) (OTP) Reset password
        10) (Email) Forgot password  
        11) (Email) Reset password
        12) Account information
        13) Account information update
        14) Vendor store location update
        15) Vendor profile image upload
        16) Vendor profile image delete
        17) Store gallery images upload
        18) Store gallery images delete
*/

// 01) ✅ VENDOR: First Login
exports.projectName_Vendor_Account_First_Time_Login = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring request object
    const { email, oneTimePassword } = req.body;
    if (!email || !oneTimePassword) {
      return next(new ErrorHandler(`Please provide all details`, 400));
    }

    // b) Checking if vendor exist and if credential are correct
    const vendor = await Vendors.findOne({
      primaryEmail: email.toLowerCase(),
    }).select("+oneTimePassword");

    if (!vendor || vendor.oneTimePassword !== oneTimePassword) {
      return next(new ErrorHandler("Invalid Credential", 401));
    }

    // c) Generating OTP for vendor account
    const OTP = OTPgenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      digits: true,
      specialChars: false,
    });

    // d) Sending OTP to vendor
    let emailSuccess = false;
    let expireTime = Date.now() + 960000;
    let message = `Dear Vendor,\n\nYour store account verification OTP is ${OTP}. Use it before ${new Date(
      expireTime
    ).toString()} otherwise it will gone a expire.\n\nThanks,\nChipt`;
    try {
      await sendEmail({
        email: vendor.primaryEmail,
        subject: "Store verification OTP",
        message,
      });
      emailSuccess = true;
    } catch (err) {
      emailSuccess = false;
      return next(new ErrorHandler(err.message, 500));
    }

    // e) If OTP not sent then sending error response
    if (!emailSuccess) {
      return next(
        new ErrorHandler(`Something went wrong while sending OTP`, 404)
      );
    }

    // f) If OTP sent then saving sent OTP in vendor databse
    vendor.userOTP.otp = OTP;
    vendor.userOTP.timeToExpire = expireTime;
    vendor.userOTP.OTPVerifed = false;
    await vendor.save();

    // g) Sending response
    authToken.userSendToken(res, 200, vendor, "firstLogin", "vendor");
  }
);

// 02) ✅ VENDOR: Registration OTP Verification
exports.projectName_Vendor_Account_OTP_Verification = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring logged in vendor ID and destructuring request body
    const vendorID = req.user.id;
    const { otp } = req.body;

    // b) Sending error response if OTP not provided
    if (!otp) {
      return next(new ErrorHandler("Please enter your otp", 400));
    }

    // c) Fetching vendor and checking if vendor exists
    const vendor = await Vendors.findById({ _id: vendorID }).select(
      "+accountActive +oneTimePassword"
    );
    if (!vendor) {
      return next(new ErrorHandler("No such Vendor found!", 404));
    }

    // d) Checking if otp is expired or not
    if (vendor.userOTP.timeToExpire <= Date.now()) {
      vendor.userOTP.otp = undefined;
      vendor.userOTP.timeToExpire = Date(
        Date.now() - (24 * 0 + 60 * 0 + 60 * 0 + 5900)
      );
      vendor.userOTP.OTPVerifed = false;
      return next(new ErrorHandler("Your OTP has been Expired!.", 409));
    } else if (vendor.userOTP.timeToExpire > Date.now()) {
      if (vendor.userOTP.otp === req.body.otp) {
        vendor.userOTP.otp = undefined;
        vendor.userOTP.timeToExpire = undefined;
        vendor.userOTP.OTPVerifed = true;
        vendor.accountActive = true;
        await vendor.save();
      } else {
        return next(new ErrorHandler(`OTP doesn't match`, 400));
      }
      res.status(200).json({
        success: true,
        message: "OTP Verified",
      });
    }
  }
);

// 03) ✅ VENDOR: Resend OTP
exports.projectName_Vendor_Account_Resend_OTP = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring logged in vendor ID and destructuring request body
    const vendorID = req.user.id;

    // b) Fetching vendor and checking if vendor exists
    const vendor = await Vendors.findById({ _id: vendorID });
    if (!vendor) {
      return next(new ErrorHandler("No such Vendor found!", 404));
    }
    // console.log("147", vendor)

    // c) Generating OTP for vendor account
    const OTP = OTPgenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      digits: true,
      specialChars: false,
    });

    // d) Sending OTP to vendor
    let emailSuccess = false;
    let expireTime = Date.now() + 960000;
    let message = `Dear Vendor,\n\nVerification OTP for your account registration is ${OTP}. Use it before ${new Date(
      expireTime
    ).toString()} otherwise it will gone be expire.\n\nThanks,\nChipt`;
    try {
      await sendEmail({
        email: vendor.primaryEmail,
        subject: "Account OTP",
        message,
      });
      emailSuccess = true;
    } catch (err) {
      emailSuccess = false;
      return next(new ErrorHandler(err.message, 500));
    }

    // e) If OTP not sent then sending error response
    if (!emailSuccess) {
      return next(
        new ErrorHandler(`Something went wrong while sending OTP`, 404)
      );
    }

    // f) If OTP sent then saving sent OTP in vendor databse
    vendor.userOTP.otp = OTP;
    vendor.userOTP.timeToExpire = expireTime;
    vendor.userOTP.OTPVerifed = false;
    await vendor.save();

    // f) Sending response
    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully!",
    });
  }
);

// 04) ✅ VENDOR: Sign in
exports.projectName_Vendor_Account_Sign_In = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring the data from request body
    const { email, password } = req.body;

    // b) Checking if email and password
    if (!email || !password) {
      return next(new ErrorHandler(`Please enter email and password`, 400));
    }

    // b) Checking if user exist
    const vendorExist = await Vendors.findOne({
      primaryEmail: email.toLowerCase(),
    }).select("+accountActive +password +oneTimePassword");

    // console.log(vendorExist)
    // c) Checking password are same or not
    let firstTime = false;
    if (!vendorExist) {
      return next(new ErrorHandler("Invalid Credential", 401));
    } else if (!vendorExist.password) {
      if (vendorExist.oneTimePassword !== password) {
        return next(new ErrorHandler("Invalid Credential", 401));
      } else {
        firstTime = true;
      }
    } else if (
      !vendorExist ||
      !(await vendorExist.correctPassword(password, vendorExist.password))
    ) {
      return next(new ErrorHandler("Invalid Credential", 401));
    }

    // d) Fetching User data
    const vendor = await Vendors.findById({ _id: vendorExist._id }).select(
      "+alleyAuth userName email OTPVerified +accountActive +accountVerified"
    );
    console.log("vnd=>", vendor);

    // e) Setting cookie and sending response
    authToken.userSendToken(res, 200, vendor, "login", "vendor", firstTime);
  }
);

// 05) ✅ VENDOR: Sign out
exports.projectName_Vendor_Account_Sign_Out = CatchAsync(
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

// 06) ✅ VENDOR: Password change
exports.projectName_Vendor_Account_Password_Update = CatchAsync(
  async (req, res, next) => {
    // a) Extracting vendor id from logged in vendor
    const vendorID = req.user.id;

    // b) Fetching vendor details and checking if account exist
    const vendor = await Vendors.findById({ _id: vendorID }).select(
      "username +password +oneTimePassword +accountActive +accountVerified +name"
    );

    if (!vendor) {
      return next(new ErrorHandler(`User doesn't exist`));
    }

    // b) Validating password
    const passwordValidation = projectValidation.passwordValidation(
      req.body.newpassword
    );
    if (!passwordValidation.success) {
      return next(new ErrorHandler(`${passwordValidation.message}`, 400));
    }

    // d) Checking saved and provided password are save or not
    let ispasswordMatch;
    if (vendor.oneTimePassword && !vendor.password) {
      ispasswordMatch =
        req.body.oldpassword === vendor.oneTimePassword ? true : false;
    } else if (!vendor.oneTimePassword && vendor.password) {
      ispasswordMatch = await vendor.correctPassword(
        req.body.oldpassword,
        vendor.password
      );
    }
    if (!ispasswordMatch) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }
    if (req.body.newpassword !== req.body.confirmpassword) {
      return next(new ErrorHandler("Passwords doesn't match.", 404));
    }

    // e) Saving password
    vendor.password = req.body.newpassword;
    vendor.accountVerified = true;
    vendor.oneTimePassword = undefined;
    await vendor.save();

    // Sending cookie and response
    authToken.userSendToken(res, 200, vendor, "passwordupdate", "vendor");
  }
);

// 07) ✅ VENDOR: (OTP) Forgot password
exports.projectName_Vendor_Account_Password_Forgot_OTP = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring request body and checking if email provided
    const { email } = req.body;
    if (!email) {
      return next(
        new ErrorHandler(`Please provide your registered Email`, 401)
      );
    }

    // b) Fetching vendor and checking if vendor exist
    const vendor = await Vendors.findOne({
      primaryEmail: req.body.email.toLowerCase(),
    });
    if (!vendor) {
      return next(new ErrorHandler("No vendor with that email", 404));
    }

    // c) OTP generation
    const otp = OTPgenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // d) Sending email to vendor and if it fail sending error response
    let emailSend = false;
    let expireTime = Date.now() + 960000;
    const message = `Dear Vendor,\n\nOTP for you account password recovery is:- ${otp}, Use it before ${new Date(
      expireTime
    ).toString()} otherwise it will expire. \n\n If you have not request this email then please ignore this!\n\nThanks\nChipt`;
    await sendEmail({
      email: req.body.email,
      subject: "Chipt Account Password Reset",
      message,
    })
      .then(() => (emailSend = true))
      .catch(() => (emailSend = false));

    if (!emailSend) {
      return next(
        new ErrorHandler("Something went wrong while sending the mail!", 500)
      );
    }

    // e) Saving OTP in vendor record and sending success response
    vendor.forgotOTP.otp = otp;
    vendor.forgotOTP.OTPVerifed = false;
    vendor.forgotOTP.timeToExpire = expireTime;
    vendor.resetPasswordToken = undefined;
    vendor.resetPasswordTokenExpire = Date.now();
    await vendor.save();
    res.status(200).json({
      success: true,
      message: `OTP sent to ${req.body.email}`,
    });
  }
);

// 08) ✅ VENDOR: (OTP) Forgot OTP verification
exports.projectName_Vendor_Account_Reset_OTP_Verification = CatchAsync(
  async (req, res, next) => {
    // a) Destructuting request body and checking it they are provided
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(
        new ErrorHandler(`Please provide Email and OTP for verification!`, 400)
      );
    }

    // b) Fetching Vendor and checking if they exist
    const vendor = await Vendors.findOne({
      primaryEmail: req.body.email.toLowerCase(),
    });
    if (!vendor) {
      return next(new ErrorHandler(`No such vendor exist by this email`, 404));
    }

    // c) Verifying if saved and proided OTP are same
    if (vendor.forgotOTP.otp !== req.body.otp) {
      return next(new ErrorHandler(`OTP does not match`, 403));
    }

    vendor.forgotOTP.otp = undefined;
    vendor.forgotOTP.timeToExpire = Date.now();
    vendor.forgotOTP.OTPVerifed = true;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: `OTP verified successfully`,
    });
  }
);

// 09) ✅ VENDOR: (OTP) Reset password
exports.projectName_Vendor_Account_Password_Reset_After_OTP_Verified =
  CatchAsync(async (req, res, next) => {
    // a) Destructuring request body and checking for all fields required
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
      return next(new ErrorHandler("Please provide all details", 400));
    }

    // b) Fetching vendor details and checking if they exist
    const vendor = await Vendors.findOne({
      primaryEmail: req.body.email.toLowerCase(),
    });
    if (!vendor) {
      return next(new ErrorHandler("No such vendor exists", 404));
    }

    // c) Checking if OTP is verified and if new and confirm password are same
    if (!vendor.forgotOTP.OTPVerifed) {
      return next(
        new ErrorHandler(
          `OTP is not verified, Please try again after some time!`,
          400
        )
      );
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("Passwords doesn't match.", 404));
    }

    // d) Saving password and other details
    vendor.password = req.body.newPassword;
    vendor.forgotOTP.otp = undefined;
    vendor.forgotOTP.timeToExpire = Date.now();
    vendor.forgotOTP.OTPVerifed = true;
    (vendor.resetPasswordToken = undefined),
      (vendor.resetPasswordExpire = Date.now());
    await vendor.save();

    // e) Sending response
    authToken.userSendToken(res, 200, vendor, "passwordreset", "vendor");
  });

// 10) ✅ VENDOR: (Email) Forgot password
exports.projectName_Vendor_Account_Password_Forgot_Email = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring request body and checking if data are provided
    const { email } = req.body;
    if (!email) {
      return next(
        new ErrorHandler("Please enter your registered Email address!", 400)
      );
    }

    // b) Fetching user and checking if vendor exist
    const vendor = await Vendors.findOne({
      primaryEmail: req.body.email.toLowerCase(),
    });
    if (!vendor) {
      return next(
        new ErrorHandler(`No such vendor exist with this email!`, 404)
      );
    }

    // c) Get ResetPasswordToken
    const resetToken = await vendor.getResetPasswordToken();
    await vendor.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/vendor/password/reset/${resetToken}`;

    // d) Sending email to vendor and if it fail sending error response
    let emailSend = false;
    const message = `Dear Vendor,\n\nYour password reset token is:- \n\n ${resetPasswordUrl}, \n\n If you have not request this email then please ignore it.\n\nThanks\nChipt`;
    await sendEmail({
      email: req.body.email,
      subject: "Chipt Account Password Reset",
      message,
    })
      .then(() => (emailSend = true))
      .catch(() => (emailSend = false));

    if (!emailSend) {
      vendor.resetPasswordToken = undefined;
      vendor.resetPasswordTokenExpire = undefined;
      await vendor.save();
      return next(
        new ErrorHandler("Something went wrong while sending the mail!", 500)
      );
    }

    // e) Sending response on email success
    res.status(200).json({
      success: true,
      message: `Email sent to ${req.body.email}`,
      resetToken,
    });
  }
);

// 11) ✅ VENDOR: (Email) Reset password
exports.projectName_Vendor_Account_Password_Reset = CatchAsync(
  async (req, res, next) => {
    // a) Creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // b) Fetching vendor using reset token
    const vendor = await Vendors.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    // c) Checking if vendor exist and if new and confirm passwords are same
    if (!vendor) {
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

    // d) Saving password and other details
    vendor.password = req.body.newPassword;
    vendor.forgotOTP.otp = undefined;
    vendor.forgotOTP.timeToExpire = Date.now();
    vendor.forgotOTP.OTPVerifed = true;
    (vendor.resetPasswordToken = undefined),
      (vendor.resetPasswordExpire = Date.now());
    await vendor.save();

    // e) Sending response
    authToken.userSendToken(res, 200, vendor, "passwordreset", "vendor");
  }
);

// 12) ✅ VENDOR: Account information
exports.projectName_Vendor_Account_Informations = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor ID from loggin vendor
    const vendorID = req.user.id;

    // b) Fetching vendor details and checking if it exist
    const vendor = await Vendors.findById({ _id: vendorID }).select(
      "+accountActive +accountVerified +registrationID +name username primaryEmail +secondaryEmail countryCode +primaryContactNumber +secondaryContactNumber +dateOfRegistration plotnumber address city state country zipCode profilePicture location"
    );

    if (!vendor) {
      return next(new ErrorHandler("No Vendor information found.", 404));
    }

    // c) Sending response
    userAuthenticationResponses.userProfileInformationResponse(
      res,
      200,
      "vendor",
      vendor
    );
  }
);

// 13) ✅ VENDOR: Account information update
exports.projectName_Vendor_Account_Information_Update = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor data and checking if it exists
    const vendorCheck = await Vendors.findById({ _id: req.user.id }).select(
      "primaryEmail +secondaryEmail +primaryContactNumber +secondaryContactNumber"
    );
    if (!vendorCheck) {
      return next(
        new ErrorHandler(
          `Vendor doesn't exist with Email address provided`,
          404
        )
      );
    }

    // b) Destructuring request body and Checking if all field are provided
    const { username, email } = req.body;
    if (!username || !email) {
      return next(new ErrorHandler("Please provide all details"), 400);
    }

    // c) Validating username, primaryEmail, secondaryEmail, primaryContact, secondaryContact and checking if they exists
    // c.1) Checking if primary and secondary emails are same

    // c.2) Primary email
    if (req.body.email) {
      if (req.body.email.toLowerCase() === vendorCheck.primaryEmail) {
      } else {
        const emCheck = await utilsMiddleware.userEmailExistanceCheck(
          req.body.email.toLowerCase()
        );
        if (emCheck) {
          return next(
            new ErrorHandler(
              `User with this ${req.body.email} address has been registered before`,
              409
            )
          );
        }
      }
    }

    // c.4) Checking if primary and secondary contacts are same
    // c.5) Primary contact
    if (req.body.contact) {
      if (req.body.contact === vendorCheck.primaryContactNumber) {
      } else {
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
    }

    // e) User registration in database
    vendorCheck.name = req.body.name;
    vendorCheck.username = req.body.username;
    vendorCheck.countryCode = req.body.countryCode;
    vendorCheck.primaryContactNumber = req.body.contact;
    vendorCheck.plotnumber = req.body.plotnumber;
    vendorCheck.address = req.body.address;
    vendorCheck.city = req.body.city;
    vendorCheck.state = req.body.state;
    vendorCheck.country = req.body.country;
    vendorCheck.zipCode = req.body.zipCode;
    vendorCheck.location = {
      type: "Point",
      coordinates: req.body.location,
    };
    await vendorCheck.save();

    // h) Setting cookie and sending response
    res.status(200).json({
      success: true,
      message: "Account updated",
    });
  }
);

// 14) ✅ VENDOR: Store location update
exports.projectName_Vendor_Store_Location_Updated = CatchAsync(
  async (req, res, next) => {
    // a) Fetching user ID from
    const vendorId = req.user.id;
    const location = req.body.location;
    if (!location)
      return next(new ErrorHandler(`Please provide location`, 400));

    // b) Fetching vendor account and checking for error
    const vendor = await Vendors.findById({ _id: vendorId }).select("location");
    if (!vendor) {
      return next(new ErrorHandler(`Something went wrong`, 200));
    }

    // c) Saving vendor location
    vendor.location.coordinates = req.body.location;
    await vendor.save();

    // e) Sending response
    res.status(200).json({
      success: true,
      message: `Location updated`,
      vendor,
    });
  }
);

// 15) ✅ VENDOR: Profile image upload
exports.projectName_Vendor_Account_Profile_Image_Upload = CatchAsync(
  async (req, res, next) => {
    // a) Variable declaration and fetching customerID
    let resizedImage;
    let vendorID = req.user.id;

    // b) checking if the image is present or not
    if (!req.files.file)
      return next(new ErrorHandler("No image is provided.", 404));
    if (req.files.file.length > 1)
      return next(new ErrorHandler(`Please upload only single file`, 400));

    // c) Fetching vendor details
    const vendor = await Vendors.findById({ _id: vendorID }).select(
      "profilePicture"
    );

    // d) Compressing image
    await utilsMiddleware
      .utilsUploadProfileImage(req.files.file)
      .then((data) => {
        resizedImage = data;
      });

    // e) Uploading image in database
    if (vendor.profilePicture.public_id.toString() !== "default/user_jvowub") {
      await cloudinary.uploader.destroy(vendor.profilePicture.public_id);
    }

    const myCloud = await cloudinary.v2.uploader.upload_stream(
      { folder: `vendors/${vendor._id}/profilePicture` },
      async function (err, image) {
        req.body.profilePicture = {
          public_id: image.public_id,
          url: image.url,
        };

        // f) Saving vendor profile picture
        vendor.profilePicture = req.body.profilePicture;
        await vendor.save().then(() => {
          userAuthenticationResponses.userProfileImageUploadResponse(res, 200);
        });
      }
    );

    // g) Saving data using stream
    await streamifier.createReadStream(resizedImage.data).pipe(myCloud);
  }
);

// 16) ✅ VENDOR: Profile image delete
exports.projectName_Vendor_Account_Profile_Image_Delete = CatchAsync(
  async (req, res, next) => {
    // a) Fetching vendor ID
    let vendorID = req.user.id;

    // b) Fetching vendor details
    const vendor = await Vendors.findById({ _id: vendorID }).select(
      "profilePicture"
    );

    if (!vendor.profilePicture) {
      return next(new ErrorHandler("No image found", 200));
    }

    // c) Checking for default image data
    if (vendor.profilePicture.public_id.toString() === "default/user_jvowub") {
      return res.status(200).json({
        success: true,
        message: "No Image uploaded",
      });
    }

    // d) Destroying cloudinary image and setting default image in profile
    const publicID = vendor.profilePicture.public_id;
    await cloudinary.uploader.destroy(publicID);
    vendor.profilePicture = {
      public_id: "default/user_jvowub",
      url: "https://res.cloudinary.com/dl0p1krhq/image/upload/v1706509827/default/user_jvowub.png",
    };
    await vendor.save();

    // e) Sending response
    res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
    });
  }
);

// 17) ✅  VENDOR: Store gallery images upload
exports.projectName_Vendor_Account_Store_Images_Upload = CatchAsync(
  async (req, res, next) => {
    // a) Variable declaration and fetching customerID
    let resizedImage;
    let vendorID = req.user.id;
    let uploadLenCheck = 0;
    let uploadImages = [];

    // b) checking if the image is present or not
    if (!req.files.file)
      return next(new ErrorHandler("No image is provided.", 404));

    // c) Fetching vendor details
    const vendor = await Vendors.findById({ _id: vendorID }).select(
      "storeImages"
    );

    if (typeof req.files.file === "object") {
      uploadImages.push(req.files.file);
    } else {
      uploadImages = req.files.file;
    }

    // d) Compressing image
    await utilsMiddleware
      .utilsUploadMultipleImages(uploadImages)
      .then((data) => {
        resizedImage = data;
      });

    for (let i = 0; i < resizedImage.length; i++) {
      const myCloud = await cloudinary.v2.uploader.upload_stream(
        { folder: `vendors/${vendor._id}/gallery` },
        async function (err, image) {
          let temp = {
            public_id: image.public_id,
            url: image.url,
          };
          vendor.storeImages.push(temp);
          uploadLenCheck += 1;
          if (uploadLenCheck === resizedImage.length) {
            await vendor.save();
            userAuthenticationResponses.userGelleryImagesUploadResponse(
              res,
              200
            );
          }
        }
      );
      // g) Saving data using stream
      streamifier.createReadStream(resizedImage[i].data).pipe(myCloud);
    }
  }
);

// 18) ✅  VENDOR: Store gallery images delete
exports.projectName_Vendor_Account_Store_Image_Delete = CatchAsync(
  async (req, res, next) => {
    // a) Variable declaration and fetching customerID
    let vendorID = req.user.id;
    let imageID = req.params.gid;

    // c) Fetching vendor details
    const vendor = await Vendors.findById({ _id: vendorID }).select(
      "storeImages"
    );
    if (!vendor.storeImages || vendor.storeImages.length === 0) {
      return next(new ErrorHandler("No image found", 200));
    }

    let publicID;
    const updated = vendor.storeImages.filter((data) => {
      if (data._id.toString() === imageID.toString()) {
        publicID = data.public_id;
        return;
      }
      return data;
    });

    await cloudinary.uploader.destroy(publicID);
    vendor.storeImages = updated;
    await vendor.save();
    res.status(200).json({
      success: true,
      message: "Image deleted",
      length: vendor.storeImages.length,
      vendor,
    });
  }
);

// 19) Fetching notifications
exports.projectName_Vendor_Account_Notification = CatchAsync(
  async (req, res, next) => {
    const vedorID = req.user.id;

    const vendorNotification = await InAppNotification.find({
      toVendor: vedorID,
      messageRead: false,
    })
      .populate("toVendor", "+name profilePicture")
      .populate("sentAdmin", "+name profilePicture")
      .populate("sentCustomer", "+firstname profilePicture");

    if (!vendorNotification || vendorNotification.length < 1) {
      return res.status(200).json({
        success: false,
        message: "No notification found",
      });
    }

    res.status(200).json({
      success: false,
      message: "Vendor notification",
      vendorNotification,
    });
  }
);
