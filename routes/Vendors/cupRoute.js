const express = require('express')
const router = express.Router();
const authToken = require('../../utils/authToken.js');
const utilsCupsController = require('../../controllers/utilController/utilsCupController.js');
const vendorCupReturnController = require('../../controllers/Vendors/vendorCupReturnController.js');


/*
    Index:
        01) Available cups in inventory
        02) Unavailable cups in inventory
        03) Cup details in inventory
*/ 


// 01) VENDOR: Available cups in inventory
router.route('/all/available/inventory').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCupsController.projectName_Admin_Vendor_Cup_Available_Cups_In_Inventory
)

// 02) VENDOR: Unavailable cups in inventory
router.route('/all/unavailable/inventory').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCupsController.projectName_Admin_Vendor_Cup_Not_Available_Cups_In_Inventory
)

// 03) VENDOR: Cup details in inventory
router.route('/details/:id/inventory').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCupsController.projectName_Admin_Vendor_Cup_Details_Available_In_Inventory
)

// 05) Vendor store cup details
router.route('/store/cup/detail').put(
    authToken.isUserAuthenticated, 
    authToken.isUserAccountActive, 
    authToken.userAuthorizedRole(['vendor', 'employee']),
    vendorCupReturnController.projectName_Vendor_Single_Cup_Details_After_Scan
    
);

module.exports = router;