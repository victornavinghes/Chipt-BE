const express = require('express')
const router = express.Router();
const authToken = require('../../utils/authToken.js');

const authenticationController = require('../../controllers/Vendors/vendorAuthenticationController.js');
const UtilsVendorController = require('../../controllers/utilController/utilsVendorController.js')

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
        18) Fetching gallery images
        19) Store gallery images delete
*/ 

// 01) VENDOR: First Login
router.route('/first/login').post(
    authenticationController.projectName_Vendor_Account_First_Time_Login
);

// 02) VENDOR: Registration OTP Verification
router.route('/store/verification').put(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authenticationController.projectName_Vendor_Account_OTP_Verification
);

// 03) VENDOR: Resend OTP
router.route('/resend/otp').get(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authenticationController.projectName_Vendor_Account_Resend_OTP
);

// 04) VENDOR: Sign in
router.route('/signin').post(
    authenticationController.projectName_Vendor_Account_Sign_In
);

// 05) VENDOR: Sign out
router.route('/signout').get(
    authToken.isUserAuthenticated,
    authenticationController.projectName_Vendor_Account_Sign_Out
);

// 06) VENDOR: Password change
router.route('/password/change').put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    authenticationController.projectName_Vendor_Account_Password_Update
);

// 07) VENDOR: (OTP) Forgot password
router.route('/otp/forgot/password').post(
    authenticationController.projectName_Vendor_Account_Password_Forgot_OTP
);

// 08) VENDOR: (OTP) Forgot OTP verification
router.route('/otp/password/verification').put(
    authenticationController.projectName_Vendor_Account_Reset_OTP_Verification
);

// 09) VENDOR: (OTP) Reset password
router.route('/otp/reset/password').put(
    authenticationController.projectName_Vendor_Account_Password_Reset_After_OTP_Verified
);

// 10) VENDOR: (Email) Forgot password  
router.route('/email/forgot/password').post(
    authenticationController.projectName_Vendor_Account_Password_Forgot_Email
);

// 11) VENDOR: (Email) Reset password
router.route('/reset/password/:token').put(
    authenticationController.projectName_Vendor_Account_Password_Reset
);

// 12) VENDOR: Account information
router.route('/information').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    authenticationController.projectName_Vendor_Account_Informations
);

// 13) VENDOR: Account information update
router.route('/information/update').put(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    authenticationController.projectName_Vendor_Account_Information_Update
);

// 14) VENDOR: Store location update
router.route('/store/location/update').put(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    authenticationController.projectName_Vendor_Store_Location_Updated
);

// 15) VENDOR: Profile image upload
router.route('/profile/image/upload').put(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    authenticationController.projectName_Vendor_Account_Profile_Image_Upload
);

// 16) VENDOR: Profile image delete
router.route('/profile/image/delete').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    authenticationController.projectName_Vendor_Account_Profile_Image_Delete
);

// 17) VENDOR: Store gallery images upload
router.route('/store/images/upload').put(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    authenticationController.projectName_Vendor_Account_Store_Images_Upload
);

// 18) VENDOR: Fetching gallery images
router.route('/store/images').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_Vendor_Account_All_Store_Images
);

// 19) VENDOR: Store gallery images delete
router.route('/store/image/delete/:gid').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    authenticationController.projectName_Vendor_Account_Store_Image_Delete
);

// 19) VENDOR: Notification
router.route('/all/notifications').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    authenticationController.projectName_Vendor_Account_Notification
);


module.exports = router;