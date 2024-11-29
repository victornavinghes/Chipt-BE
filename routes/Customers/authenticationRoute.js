const express = require("express");
const router = express.Router();
const authToken = require("../../utils/authToken.js");
const customerAuthentication = require("../../controllers/Customer/customerAuthentiationControllers.js");

/*
    Index: 
        01) Sign up
        02) OTP verification
        03) Resend OTP
        04) Sign In
        05) Sign out
        06) Password change
        07) (OTP) forgot password
        08) (OTP) forgot OTP verification
        09) 
        10) (OTP) reset password
        11) (Email) forgot password
        12) (Email) reset password
        13) Profile Information
        14) Contact Update
        15) Basic Information Update
        16) Address Update
        17) Location Update
        18) Profile image upload
        19) Profile image deletion
        20) Profile image
*/

router
  .route("/auth")
  .post(customerAuthentication.projectName_Customer_Firebase_Auth);

router
  .route("/auth-signup")
  .post(customerAuthentication.projectName_Customer_Auth_Sign_Up);

// 01) CUSTOMER: Sign up
router
  .route("/signup")
  .post(customerAuthentication.projectName_Customer_Account_Sign_Up);

// 02) CUSTOMER: OTP verification
router
  .route("/otp/verification")
  .put(
    authToken.isUserAuthenticated,
    customerAuthentication.projectName_Customer_Account_OTP_Verification
  );

// 03) CUSTOMER: Resend OTP
router
  .route("/resend/otp")
  .get(
    authToken.isUserAuthenticated,
    authToken.userDataClear,
    customerAuthentication.projectName_Customer_Account_Resend_OTP
  );

// 04) CUSTOMER: Sign In
router
  .route("/signin")
  .post(customerAuthentication.projectName_Customer_Account_Sign_In);

// 05) CUSTOMER: Sign out
router.route("/signout").get(
  // authToken.isUserAuthenticated,
  authToken.userDataClear,
  customerAuthentication.projectName_Customer_Account_Sign_Out
);

// 06) CUSTOMER: Password change
router
  .route("/password/change")
  .put(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerAuthentication.projectName_Customer_Account_Password_Update
  );

// 07) CUSTOMER: (OTP) forgot password
router
  .route("/forgot/password/otp")
  .post(
    customerAuthentication.projectName_Customer_Account_Password_Forgot_OTP
  );

// 08) CUSTOMER: (OTP) forgot OTP verification
router
  .route("/forgot/otp/verify")
  .put(
    customerAuthentication.projectName_Customer_Account_Reset_OTP_Verification
  );

// 09) CUSTOMER:

// 10) CUSTOMER: (OTP) reset password
router
  .route("/password/reset/otp")
  .put(
    customerAuthentication.projectName_Customer_Account_Password_Reset_After_OTP_Verified
  );

// 11) CUSTOMER: (Email) forgot password
router
  .route("/forgot/password/email")
  .post(
    customerAuthentication.projectName_Customer_Account_Password_Forgot_Email
  );

// 12) CUSTOMER: (Email) reset password
router
  .route("/password/reset/:token")
  .put(
    customerAuthentication.projectName_Customer_Account_Password_Reset_Email
  );

// 13) CUSTOMER: Profile Information
router
  .route("/information")
  .get(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerAuthentication.projectName_Customer_Account_Informations
  );

// 14) CUSTOMER: Contact Update
router
  .route("/contact/update")
  .put(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerAuthentication.projectName_Customer_Account_Contact_Update
  );

// 15) CUSTOMER: Basc Information Update
router
  .route("/basic/info/update")
  .put(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerAuthentication.projectName_Customer_Account_Basic_Information_Update
  );

// 16) CUSTOMER: Address Update
router
  .route("/address/update")
  .put(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerAuthentication.projectName_Customer_Account_Address_Update
  );

// 17) CUSTOMER: Location Update
router
  .route("/location/update")
  .put(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerAuthentication.projectName_Customer_Account_Location_Update
  );

// 18) CUSTOMER: Profile image upload
router
  .route("/profile/image/upload")
  .put(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerAuthentication.projectName_Customer_Account_Profile_Image_Upload
  );

// 19) CUSTOMER: Profile image deletion
router
  .route("/profile/image/delete")
  .get(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerAuthentication.projectName_Customer_Account_Profile_Image_Delete
  );

// 20) CUSTOMER: Profile image
router
  .route("/profile/image")
  .get(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerAuthentication.projectName_Customer_Account_Profile_Image
  );

// 21) VENDOR: Notification
router
  .route("/all/notifications")
  .get(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerAuthentication.projectName_Customer_Account_Notification
  );

// 21) VENDOR: Notification
router
  .route("/verstatus")
  .get(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    authToken.userDataClear,
    customerAuthentication.projectName_Customer_Account_Status
  );

router
  .route("/check-credit/:vendorId")
  .get(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    customerAuthentication.checkUserCreditForVendor
  );

module.exports = router;
