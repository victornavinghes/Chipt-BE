const catchAsync = require("../../errors/catchAsync");
const Package = require("../../models/Package/Package");
const ErrorHandler = require("../../utils/errorHandler");

const AddPackageController = catchAsync(async (req, res, next) => {
  const { name, description, price, freeCupCredits, totalCredits, isActive } =
    req.body;

  if (!name || !price || !totalCredits) {
    return next(new ErrorHandler(`Please provide all required details`, 400));
  }

  const newPackage = new Package({
    name,
    description,
    price,
    freeCupCredits,
    totalCredits,
    isActive,
  });

  await newPackage.save();

  res.status(201).json({
    success: true,
    message: "Package created",
  });
});

const GetAllPackagesController = catchAsync(async (req, res, next) => {
  const packages = await Package.find();

  res.status(200).json({
    success: true,
    data: packages,
  });
});

const UpdatePackageController = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, freeCupCredits, totalCredits, isActive } =
    req.body;

  if (!name || !price || !totalCredits) {
    return next(new ErrorHandler(`Please provide all required details`, 400));
  }

  const packageToUpdate = await Package.findById(id);

  if (!packageToUpdate) {
    return next(new ErrorHandler(`Package not found with id ${id}`, 404));
  }

  const updatedPackage = await Package.findByIdAndUpdate(
    id,
    {
      name,
      description,
      price,
      freeCupCredits,
      totalCredits,
      isActive,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Package updated",
    data: updatedPackage,
  });
});

const DeletePackageController = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const packageToDelete = await Package.findById(id);

  if (!packageToDelete) {
    return next(new ErrorHandler(`Package not found with id ${id}`, 404));
  }

  await Package.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Package deleted",
  });
});

const GetSinglePackageController = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const package = await Package.findById(id);

  if (!package) {
    return next(new ErrorHandler(`Package not found with id ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: package,
  });
});

module.exports = {
  AddPackageController,
  GetAllPackagesController,
  UpdatePackageController,
  DeletePackageController,
  GetSinglePackageController,
};
