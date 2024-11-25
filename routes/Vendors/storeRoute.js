const express = require('express')
const router = express.Router();
const authToken = require('../../utils/authToken.js');
const vendorCupsController = require('../../controllers/Vendors/vendorStoreController.js');
const UtilsStoreStockController = require('../../controllers/utilController/utilsVendorController.js');

/*
    Index: 
        01) New Stock Request creation
        02) Single vendor cups stock in store 
        03) Single vendor all raised cup requests
        04) Single vendor pending stock requests
        05) Single vendor rejected stock requests
        06) Single vendor accepted stock requests
        07) Single stock request information
        08) Dashboard data
*/ 


// 01) VENDOR: New Stock Request creation
router.route('/new/stock/request').post(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    vendorCupsController.projectName_Vendor_Store_New_Cup_Stock_Request
)

// 02) VENDOR: Store Stock Details
router.route('/stock/information').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    UtilsStoreStockController.projectName_Utils_Single_Vendor_Store_Cup_Stock
)

// 03) VENDOR: Stock Requests list
router.route('/stock/requests').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    UtilsStoreStockController.projectName_Utils_Single_Vendor_Cup_Stock_Requests
)

// 04) VENDOR: Pending Stock requests
router.route('/pending/stock/requests').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    UtilsStoreStockController.projectName_Utils_Single_Vendor_Pending_Cup_Stock_Requests
)

// 05) VENDOR: Rejected Stock Requests
router.route('/rejected/stock/requests').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    UtilsStoreStockController.projectName_Utils_Single_Vendor_Rejected_Cup_Stock_Requests
)

// 06) VENDOR: Accepted Stock Requests
router.route('/accepted/stock/requests').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    UtilsStoreStockController.projectName_Utils_Single_Vendor_Accepted_Cup_Stock_Requests
)

// 07) VENDOR: Stock request information
router.route('/stock/request/:rid').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    UtilsStoreStockController.projectName_Utils_Vendor_Single_Cup_Stock_Request_Information
)

// 08) VENDOR: Store stock update
router.route('/stock/update/:rid').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    vendorCupsController.projectName_Vendor_Updating_Vendor_Store_Stock
)

// 09) VENDOR: Dashboard Data 
router.route('/dashboard/all/details').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    UtilsStoreStockController.projectName_Utils_Vendor_Show_All_Information
);

module.exports = router;