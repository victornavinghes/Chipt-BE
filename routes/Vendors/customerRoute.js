const express = require('express')
const router = express.Router();
const authToken = require('../../utils/authToken.js');
const utilsCostomerController = require('../../controllers/utilController/utilsCustomersController.js');

/*
    Index:
        01) All customers
        02) Customer profile information
        03) Active customers
        04) Inactive customers
        05) All customers order from a vendor
        06) All customers payment to a vendor
        07) Customer orders
        08) Customer Single Order Details
        09) Customers orders from a vendor
        10) Customer transactions
        11) Single transaction details
        12) Customer payment to a vendor

*/

// 01) VENDOR: All customers
router.route('/all').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_All_Customers_List
)

// 02) VENDOR: Customer profile information
router.route('/profile/:id').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Cusotmer_Account_Information
)

// 03) VENDOR: Active customers
router.route('/all/account/active').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Active_Customers_Account_List
)

// 04) VENDOR: Inactive customers
router.route('/all/account/inactive').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_InActive_Customers_Account_List
)

// 05) VENDOR: All customers order from a vendor
router.route('/vendor/:id/all/orders').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customers_Orders_From_Vendor
)

// 06) VENDOR: All customers payment to a vendor
router.route('/vendor/:id/transactions').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customers_All_Transactions_To_Vendor
)

// 07) VENDOR: Customer orders
router.route('/:id/orders').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Single_Customer_Orders_List
)

// 08) VENDOR: Customer Single Order Details
router.route('/single/order/:id').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Single_Customer_Order_Information
)

// 09) VENDOR: Customers orders from a vendor
router.route('/orders/from/vendor').put(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customer_Orders_From_Vendor
)

// 10) VENDOR: Customer transactions
router.route('/:id/transactions').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customer_All_Transactions_List
)

// 11) VENDOR: Single transaction details
router.route('/transaction/:id').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customer_Single_Transaction_Informatiom
)

// 12) VENDOR: Customer payment to a vendor
router.route('/vendor/transactions').put(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customer_All_Transactions_To_Vendor
)

// 12) VENDOR: Customers added year based
router.route('/yrs').get(
    authToken.isUserAuthenticated,
    authToken.vendorPasswordUpdateChecker,
    authToken.isUserAccountActive,
    authToken.userAuthorizedRole(['vendor', 'employee']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customers_Added_Month_Based
)

module.exports = router;