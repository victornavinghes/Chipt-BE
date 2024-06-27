const express = require('express')
const router = express.Router();
const authToken = require('../../utils/authToken.js');
const UtilsVendorController = require('../../controllers/utilController/utilsVendorController.js');
const CustomerVendorsController = require('../../controllers/Customer/vendorsController.js');

/*
    Index:
        01) All vendors list
        02) Vendor details
        03) Vendor store gallery
        03) Vendor store cup available
        04) Vendor store cup details
*/ 

// 01) All vendors list
router.route('/all').put(
    // authToken.isUserAuthenticated, 
    // authToken.isUserAccountActive, 
    // authToken.userAuthorizedRole(['customer', 'customer']),
    CustomerVendorsController.projectName_Customer_All_Vendors_List
);

// 02) Vendor details
router.route('/:vid/details').get(
    // authToken.isUserAuthenticated, 
    // authToken.isUserAccountActive, 
    // authToken.userAuthorizedRole(['customer', 'customer']),
    CustomerVendorsController.projectName_Customer_Single_Vendor_Information
);

// 03) Vendor store gallery
router.route('/:id/store/images').get(
    // authToken.isUserAuthenticated,
    // authToken.isUserAccountActive,
    // authToken.userAuthorizedRole(['customer', 'customer']),
    UtilsVendorController.projectName_Utils_Vendor_Account_All_Store_Images
);

// 04) Vendor store cup available
router.route('/:vid/store/cups').get(
    // authToken.isUserAuthenticated, 
    // authToken.isUserAccountActive, 
    // authToken.userAuthorizedRole(['customer', 'customer']),
    CustomerVendorsController.projectName_Customer_Vendor_Store_Stock_Information
);

// 05) Vendor store cup details
router.route('/store/cup/detail').put(
    // authToken.isUserAuthenticated, 
    // authToken.isUserAccountActive, 
    // authToken.userAuthorizedRole(['customer', 'customer']),
    CustomerVendorsController.projectName_Customer_Single_Cup_Details_After_Scan
);


module.exports = router;