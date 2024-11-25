const express = require('express')
const router = express.Router();
const authToken = require('../../utils/authToken.js');
const utilsCostomerController = require('../../controllers/utilController/utilsCustomersController.js');

/*
    Index:
        01) Customers list
        02) Customer information
        03) Enable/Disable customer account
        04) Enabled customers account
        05) Disabled customers list
        06) All customers orders list
        07) All customers order from a vendor
        08) All customers transactions
        09) All customer payment to a vendor
        10) Single customer orders list
        11) Single customer order from a vendor
        12) Single customer single order details
        13) Single customer all transactions
        14) Customer all transactions to vendor
        15) Single customer single transaction
*/ 


// 01) ADMIN: All customers
router.route('/all').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_All_Customers_List
)

// 02) ADMIN: Customer profile information
router.route('/profile/:id').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Cusotmer_Account_Information
)

// 03) ADMIN: Enable/Disable a customer
router.route('/enable/disable/:id').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customer_Account_Enable_Disable
)

// 04) ADMIN: Active customers
router.route('/all/account/active').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Active_Customers_Account_List
)

// 05) ADMIN: Inactive customers
router.route('/all/account/inactive').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_InActive_Customers_Account_List
)

// 06) ADMIN: All Customers orders
router.route('/all/orders').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_All_Customers_Orders_List
)

// 07) ADMIN: All customers order from a vendor
router.route('/vendor/:id/all/orders').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customers_Orders_From_Vendor
)

// 08) ADMIN: All customers transactions
router.route('/all/transactions').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_All_Customers_Transactions_List
)

// 09) ADMIN: All customers transactions to a vendor
router.route('/vendor/:id/transactions').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customers_All_Transactions_To_Vendor
)

// 10) ADMIN: Customer orders
router.route('/:id/orders').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Single_Customer_Orders_List
)

// 11) ADMIN: Customer Single Order Details
router.route('/single/order/:id').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Single_Customer_Order_Information
)

// 12) ADMIN: Customers orders from a vendor
router.route('/orders/from/vendor').put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customer_Orders_From_Vendor
)

// 13) ADMIN: Customer transactions
router.route('/:id/all/transactions').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customer_All_Transactions_List
);

// 15) ADMIN: Customer all transactions to vendor
router.route('/vendor/transactions').put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customer_All_Transactions_To_Vendor
)

// 14) ADMIN: Single transaction details
router.route('/transaction/:id').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCostomerController.projectName_Utils_Customer_Single_Transaction_Informatiom
)

module.exports = router;