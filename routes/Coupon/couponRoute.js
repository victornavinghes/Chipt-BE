const express = require("express");
const authToken = require("../../utils/authToken");
const {
  AddCouponController,
  GetAllCouponsController,
  UpdateCouponController,
  DeleteCouponController,
  GetSingleCouponController,
  ApplyCouponController,
} = require("../../controllers/Coupon/couponController");
const router = express.Router();

// Common middleware
const couponAuthMiddleware = [
  authToken.isUserAuthenticated,
  authToken.userAuthorizedRole(["super_vendor", "admin"]),
];

router
  .route("/apply")
  .post(
    authToken.isUserAuthenticated,
    authToken.userAuthorizedRole(["customer", "customer"]),
    ApplyCouponController
  );

router
  .route("/")
  .post(couponAuthMiddleware, AddCouponController)
  .get(couponAuthMiddleware, GetAllCouponsController);

router
  .route("/:id")
  .get(couponAuthMiddleware, GetSingleCouponController)
  .put(couponAuthMiddleware, UpdateCouponController)
  .delete(couponAuthMiddleware, DeleteCouponController);

module.exports = router;
