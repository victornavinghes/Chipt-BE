const express = require("express");
const authToken = require("../../utils/authToken");
const {
  AddPackageController,
  GetAllPackagesController,
  UpdatePackageController,
  DeletePackageController,
  GetSinglePackageController,
} = require("../../controllers/Admin/adminPackageController");
const router = express.Router();

// Common middleware
const packageAuthMiddleware = [
  // authToken.isUserAuthenticated,
  // authToken.isUserAccountActive,
  // authToken.isUserAccountVerified,
  // authToken.userAuthorizedRole(["super_vendor", "admin"]),
  // authToken.userDataClear,
];

// 1. Add the package and get all packages
router
  .route("/")
  .post(packageAuthMiddleware, AddPackageController)
  .get(packageAuthMiddleware, GetAllPackagesController);

router
  .route("/:id")
  .get(packageAuthMiddleware, GetSinglePackageController)
  .put(packageAuthMiddleware, UpdatePackageController)
  .delete(packageAuthMiddleware, DeletePackageController);

module.exports = router;
