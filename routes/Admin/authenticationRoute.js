const express = require("express");
const router = express.Router();
const authToken = require("../../utils/authToken.js");

const AdminAuthenticationController = require("../../controllers/Admin/adminAuthenticationController.js");

/* 
    Index:
        01) Sign up
        02) OTP verification
        03) Resend OTP
        04) Sign in
        05) Sign out
        06) Password update
        07) Forgot password
        08) OTP verify
        09) Reset password
        10) Profile information
        11) Profile information update
        12) Profile image upload
        13) Profile image delete
*/

// 01) ✅ ADMIN: Sign up
router
  .route("/signup")
  .post(AdminAuthenticationController.projectName_Admin_Account_Sign_Up);

// 02) ✅ ADMIN: OTP verification
router
  .route("/otp/verification")
  .put(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["super_vendor", "admin"]),
    authToken.userDataClear,
    AdminAuthenticationController.projectName_Admin_Account_OTP_Verification
  );
// 03) ✅ ADMIN: Resend OTP
router
  .route("/resend/otp")
  .get(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["super_vendor", "admin"]),
    authToken.userDataClear,
    AdminAuthenticationController.projectName_Admin_Account_Resend_OTP
  );

// 04) ✅ ADMIN: Sign in
router
  .route("/signin")
  .post(AdminAuthenticationController.projectName_Admin_Account_Sign_In);

// 05) ✅ ADMIN: Sign out
router
  .route("/signout")
  .get(
    authToken.isUserAuthenticated,
    authToken.userDataClear,
    AdminAuthenticationController.projectName_Admin_Account_Sign_Out
  );

// 06) ✅ ADMIN: Password update
router.route("/password/change").put(
  authToken.isUserAuthenticated,
  authToken.isUserAccountActive,
  //authToken.isUserAccountVerified,
  authToken.userAuthorizedRole(["super_vendor", "admin"]),
  authToken.userDataClear,
  AdminAuthenticationController.projectName_Admin_Account_Password_Change
);

// 07) ✅ ADMIN: Forgot password
router
  .route("/forgot/password")
  .post(
    AdminAuthenticationController.projectName_Admin_Account_Forgot_Password
  );

// 08) ✅ ADMIN: OTP Verify
router
  .route("/otp/verify")
  .put(
    AdminAuthenticationController.projectName_Admin_Account_Reset_OTP_Verification
  );

// 09) ✅ ADMIN: Reset password
router
  .route("/reset/password")
  .put(AdminAuthenticationController.projectName_Admin_Account_Reset_Password);

// 10) ✅ ADMIN: Profile information
router.route("/profile/details").get(
  authToken.isUserAuthenticated,
  authToken.isUserAccountActive,
  //authToken.isUserAccountVerified,
  authToken.userAuthorizedRole(["super_vendor", "admin"]),
  authToken.userDataClear,
  AdminAuthenticationController.projectName_Admin_Profile_Information
);

// 11) ✅ ADMIN: Profile information update
router.route("/profile/update").put(
  authToken.isUserAuthenticated,
  authToken.isUserAccountActive,
  //authToken.isUserAccountVerified,
  authToken.userAuthorizedRole(["super_vendor", "admin"]),
  authToken.userDataClear,
  AdminAuthenticationController.projectName_Admin_Profile_Information_Update
);

// 12) ✅ ADMIN: Profile image upload
router.route("/profile/image/upload").put(
  authToken.isUserAuthenticated,
  authToken.isUserAccountActive,
  //authToken.isUserAccountVerified,
  authToken.userAuthorizedRole(["super_vendor", "admin"]),
  authToken.userDataClear,
  AdminAuthenticationController.projectName_Admin_Account_Profile_Image_Upload
);

// 13) ✅ ADMIN: Profile image delete
router.route("/profile/image/delete").get(
  authToken.isUserAuthenticated,
  authToken.isUserAccountActive,
  //authToken.isUserAccountVerified,
  authToken.userAuthorizedRole(["super_vendor", "admin"]),
  authToken.userDataClear,
  AdminAuthenticationController.projectName_Admin_Account_Profile_Image_Delete
);

module.exports = router;
