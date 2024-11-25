const express = require('express')
const router = express.Router();
const authToken = require('../../utils/authToken.js');
const AdminVendorScontroller = require('../../controllers/Admin/adminVendorController.js');
const UtilsVendorController = require('../../controllers/utilController/utilsVendorController.js');


/*
    Index: 
        01) Vendor account registration
        02) All vendor list
        03) Vendor Profile Information
        04) Fetching vendor gallery
        05) Block/Unblock vendors
        06) Active vendors
        07) Inactive vendors
        08) All vendors cups stock in store
        09) All vendors raised store cup requests
        10) All vendors pending store stock requests
        11) All vendors rejected store stock requests
        12) All vendors accepted store stock requests
        13) Single vendor cups stock in store 
        14) Single vendor all raised store stock cup requests
        15) Single vendor pending store stock requests
        16) Single vendor rejected store stock requests
        17) Single vendor accepted store stock requests
        18) Single stock request information
*/


// 01) ADMIN: Vendor account registration
router.route('/store/registration').post(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    AdminVendorScontroller.projectName_Admin_Vendor_Account_Registration
)

// 02) ADMIN: All vendor list
router.route('/list').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    AdminVendorScontroller.projectName_Admin_All_Vendors_List
)

// 03) ADMIN: Vendor Profile Informationclear
router.route('/profile/:id').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    AdminVendorScontroller.projectName_Admin_Single_Vendor_Information
)

// 04) ADMIN: Vendor store images
router.route('/:id/store/images').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_Vendor_Account_All_Store_Images
);

// 05) ADMIN: Block/Unblock vendors
router.route('/account/block/unblock/:id').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    AdminVendorScontroller.projectName_Admin_Vendor_Account_Enable_Disable
)

// 06) ADMIN: Active vendors
router.route('/all/active/list').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    AdminVendorScontroller.projectName_Admin_All_Active_Vendors_Accounts
)

// 07) ADMIN: Inactive vendors
router.route('/all/inactive/list').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    AdminVendorScontroller.projectName_Admin_All_Inactive_Vendors_Accounts
)

// 08) ADMIN: All vendors store stock information
router.route('/all/stores/stocks').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_All_Vendors_Store_Cups_Stocks
)

// 08) ADMIN: All vendors raised store cup requests
router.route('/all/stock/requests').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_All_Vendors_Cup_Stock_Requests
)

// 09) ADMIN: All vendors pending stock requests
router.route('/all/pending/stock/requests').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_All_Vendor_Pending_Cup_Stock_Requests
)

// 10) ADMIN: All vendors rejected stock requests
router.route('/all/rejected/stock/requests').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_All_Vendor_Rejected_Cup_Stock_Requests
)

// 11) ADMIN: All vendors accepted stock requests
router.route('/all/accepted/stock/requests').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_All_Vendor_Accepted_Cup_Stock_Requests
)

// 12) ADMIN: Single vendor store stock information
router.route('/:id/store/stock').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_Single_Vendor_Store_Cup_Stock
)

// 13) ADMIN: Single vendor all raised store stock cup requests
router.route('/:id/all/stock/requests').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_Single_Vendor_Cup_Stock_Requests
)

// 14) Admin: Single vendor pending store stock requests
router.route('/:id/all/pending/stock/requests').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_Single_Vendor_Pending_Cup_Stock_Requests
)

// 15) ADMIN: Single vendor rejected store stock requests
router.route('/:id/all/rejected/stock/requests').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_Single_Vendor_Rejected_Cup_Stock_Requests
)

// 16) ADMIN: Single vendor accepted store stock requests
router.route('/:id/all/accepted/stock/requests').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_Single_Vendor_Accepted_Cup_Stock_Requests
)

// 17) ADMIN: Single stock request information
router.route('/single/stock/request/:rid').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    UtilsVendorController.projectName_Utils_Vendor_Single_Cup_Stock_Request_Information
)

// 18) ADMIN: Reject vendor store stock request
router.route('/reject/stock/request/:rid').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    AdminVendorScontroller.projectName_Admin_Reject_Vendor_Stock_Request
)

// 19) ADMIN: Accept vendor store stock request
router.route('/accept/stock/request/:rid').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    AdminVendorScontroller.projectName_Admin_Accept_Vendor_Stock_Request
)

// 20) ADMIN: Deliver vendor store stock
router.route('/stock/delivered/:rid').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    AdminVendorScontroller.projectName_Admin_Confirm_Delivery_Vendor_Store_Stock
)

module.exports = router;