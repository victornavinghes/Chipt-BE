const express = require('express')
const router = express.Router();
const authToken = require('../../utils/authToken.js');
const utilsCupsController = require('../../controllers/utilController/utilsCupController.js');
const VendorCupReturnController = require('../../controllers/Vendors/vendorCupReturnController.js');
/*
    Index:
        01) Fetching order and ordered cup details
        02) Checking if cup is eligible for return
        03) Cup detagging and tagging
        04) Cup returning payment
        05) Final cup return confirmation and vendor stock update
*/ 

// 01) CUSTOMER: Fetching order and ordered cup details
// 02) CUSTOMER: Checking if cup is eligible for return
// 03) CUSTOMER: Cup detagging and tagging
// 04) CUSTOMER: Cup returning payment
// 05) CUSTOMER: Final cup return confirmation and vendor stock update

router.route('/scanned/cup/details').put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    VendorCupReturnController.projectName_Vendor_Single_Cup_Details_After_Scan
)

router.route('/cup/check').put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    VendorCupReturnController.projectName_Vendor_Checking_Cup_Return_Condition
)

router.route('/cup/detagging').put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    VendorCupReturnController.projectName_Vendor_Detagging_Tagging_Information_Of_Cup
)


router.route('/all/cups').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    VendorCupReturnController.projectName_Vendor_All_Returned_Cups_By_Customer
)

module.exports = router;