const catchAsync = require("../../errors/catchAsync");
const Coupon = require("../../models/Coupon/Coupon");
const Customer = require("../../models/Customer/Customer");
const ErrorHandler = require("../../utils/errorHandler");

const AddCouponController = catchAsync(async (req, res, next) => {
  const { couponCode, discountType, discount, validTill } = req.body;

  if (!couponCode || !discountType || !discount || !validTill) {
    return next(new ErrorHandler(`Please provide all required details`, 400));
  }

  const newCoupon = new Coupon({
    couponCode,
    discountType,
    discount,
    validTill,
  });

  await newCoupon.save();

  res.status(200).json({
    success: true,
    message: "Coupon created",
  });
});

const GetAllCouponsController = catchAsync(async (req, res, next) => {
  const coupons = await Coupon.find();

  res.status(200).json({
    success: true,
    coupons: coupons,
  });
});

const UpdateCouponController = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { couponCode, discountType, discount, validTill } = req.body;

  if (!couponCode || !discountType || !discount || !validTill) {
    return next(new ErrorHandler(`Please provide all required details`, 400));
  }

  const couponToUpdate = await Coupon.findById(id);

  if (!couponToUpdate || couponToUpdate.deleted) {
    return next(new ErrorHandler(`Coupon not found with id ${id}`, 404));
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    id,
    {
      couponCode,
      discountType,
      discount,
      validTill,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Coupon updated",
    coupon: updatedCoupon,
  });
});

const DeleteCouponController = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const couponToDelete = await Coupon.findById(id);

  if (!couponToDelete || couponToDelete.deleted) {
    return next(new ErrorHandler(`Coupon not found with id ${id}`, 404));
  }

  couponToDelete.deleted = true;
  await couponToDelete.save();

  res.status(200).json({
    success: true,
    message: "Coupon deleted",
  });
});

const GetSingleCouponController = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);

  if (!coupon || coupon.deleted) {
    return next(new ErrorHandler(`Coupon not found with id ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    coupon: coupon,
  });
});

const ApplyCouponController = catchAsync(async (req, res, next) => {
  const { couponCode } = req.body;
  const customerId = req.user.id;

  if (!customerId) {
    return next(new ErrorHandler(`Please provide a customer id`, 400));
  }

  if (!couponCode) {
    return next(new ErrorHandler(`Please provide a coupon code`, 400));
  }

  const coupon = await Coupon.findOne({ couponCode, deleted: false });

  if (!coupon) {
    return next(new ErrorHandler(`Coupon not found or has been deleted`, 404));
  }

  if (new Date() > coupon.validTill) {
    return next(new ErrorHandler(`Coupon has expired`, 400));
  }

  const customer = await Customer.findById(customerId);

  const usedCount = customer.usedCoupons.get(couponCode) || 0;

  if (usedCount >= coupon.usageLimit) {
    return next(new ErrorHandler(`Coupon usage limit reached`, 400));
  }

  res.status(200).json({
    success: true,
    coupon: {
      couponCode: coupon.couponCode,
      discountType: coupon.discountType,
      discount: coupon.discount,
    },
  });
});

module.exports = {
  AddCouponController,
  GetAllCouponsController,
  UpdateCouponController,
  DeleteCouponController,
  GetSingleCouponController,
  ApplyCouponController,
};
