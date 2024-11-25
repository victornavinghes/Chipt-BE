const express = require('express')
const router = express.Router();
const authToken = require('../../utils/authToken.js');
const adminCupController = require('../../controllers/Admin/adminCupController.js');
const utilsCupsController = require('../../controllers/utilController/utilsCupController.js');



// 01) ADMIN: New cup details upload in inventory
router.route('/details/upload').post(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Admin_New_Cup_Information_Upload
);

// 02) ADMIN: Cups in inventory
router.route('/all/in/inventory').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Admin_All_Cups_In_Inventory
);

// 03) ADMIN: Cup details update
router.route('/:id/details/update').put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Admin_Cup_Inventory_Update
);

// 04) ADMIN: Cup price update
router.route('/:id/price/update').put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Admin_Cup_Price_Update_In_Inventory
);

// 05) ADMIN: Cup availability update
router.route('/:id/availability/update').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Admin_Cup_Availability_Status_Update
);

// 06) ADMIN: Available cups in inventory
router.route('/all/available/inventory').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCupsController.projectName_Admin_Vendor_Cup_Available_Cups_In_Inventory
);

// 07) ADMIN: Unavailable cups in inventory
router.route('/all/unavailable/inventory').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCupsController.projectName_Admin_Vendor_Cup_Not_Available_Cups_In_Inventory
);

// 08) ADMIN: Cup details in inventory
router.route('/details/:id/inventory').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    utilsCupsController.projectName_Admin_Vendor_Cup_Details_Available_In_Inventory
);

// =========================================================
// 09) ADMIN: CSV file generation
router.route('/csv/generation').post(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Generating_Cup_CSV_file
);
// =========================================================

// 09) ADMIN: CSV file generation
router.route('/all/generated/csv').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_All_Generated_Cup_CSV_files
);

router.route('/dashboard/all/details').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Admin_Get_DashBoard_Information
);

router.route('/available/cup/csv').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Admin_Fetching_All_Available_Cup
);

router.route('/add/new/cup/details').put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Admin_Adding_New_Scanned_Cup_In_DB
);

router.route('/cup/delete/:id').put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Admin_Cup_Details_Delete_In_Inventory
);

router.route('/available/list').get(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Admin_All_Available_Cups_List
);

router.route('/available/disable').put(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Admin_Disable_Available_Cups
);

// 09) ADMIN: Cup Upload Using CSV
router.route('/csv/generation').post(
    authToken.isUserAuthenticated,
    authToken.isUserAccountActive,
    authToken.isUserAccountVerified,
    authToken.userAuthorizedRole(['super_vendor', 'admin']),
    authToken.userDataClear,
    adminCupController.projectName_Generating_Cup_CSV_file
);


router.route('/upload/cup/by/csv').post(
    // authToken.isUserAuthenticated,
    // authToken.isUserAccountActive,
    // authToken.isUserAccountVerified,
    // authToken.userAuthorizedRole(['super_vendor', 'admin']),
    // authToken.userDataClear,
    adminCupController.projectName_Upload_Cup_Details_Using_CSV_Data
);

module.exports = router;