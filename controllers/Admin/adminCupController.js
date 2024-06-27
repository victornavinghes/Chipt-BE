// BuiltIn Module Import
const streamifier = require("streamifier");
const cloudinary = require("cloudinary");

// Created module import
const CatchAsync = require("../../errors/catchAsync.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const ApiFeatures = require("../../utils/apiFeatures.js");
const utilsMiddleware = require("../../controllers/utilController/utilsMiddleware.js");
const { cupsResponses } = require("../../utils/responseObjects.js");
const { generateUniqueIDForCups } = require("../utilController/utilsMiddleware.js");

// Database
const CupAvailable = require("../../models/Cups/CupAvailable.js");
const CupInventory = require("../../models/Cups/CupInventory.js");
const Vendors = require("../../models/Vendors/Vendor.js");
const Customers = require("../../models/Customer/Customer.js");
const CupStockRequest = require("../../models/Vendors/CupStockRequest.js");
const CSVData = require("../../models/Cups/CupsCSV.js");
const Cups = require("../../models/Cups/Cup.js");

/*
    Index:
        01) Cups details upload 
        02) Fetching all cups in inventory
        03) Cups Category Inventory Update
        04) Cup Category Price update
        05) Cup availability update
        06) CSV file generation
*/

// 01) ADMIN: Cups details upload
exports.projectName_Admin_New_Cup_Information_Upload = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring information
    let resizedImage;
    let uploadLenCheck = 0;
    const {
      cupSize,
      cupType,
      cupPrice,
      cupCapacity,
      numberOfCups,
      currency,
      loyalityPoint,
    } = req.body;
    if (
      (!cupSize ||
        !cupType ||
        !cupPrice ||
        !cupCapacity ||
        !numberOfCups ||
        !currency,
        loyalityPoint)
    ) {
      return next(new ErrorHandler(`Please provide all details`, 404));
    }

    // b) Checking if cup data already exists
    let cSize = req.body.cupSize.toLowerCase();
    let cType = req.body.cupType.toLowerCase();
    const isCupExist = await CupInventory.findOne({
      cupSize: cSize.toLowerCase(),
      cupType: cType.toLowerCase(),
    });
    if (isCupExist)
      return next(new ErrorHandler(`Cup details already exist`, 404));

    // c) Generating Unique ID and checking for error
    const cupAvailable = await CupAvailable.findOne({
      cupSize: cSize,
      cupType: cType,
    });

    // d) Saving cup information
    const cupInventory = await CupInventory.create({
      cupModelUniqueId: cupAvailable.modelID,
      cupSize: req.body.cupSize.toLowerCase(),
      cupType: req.body.cupType.toLowerCase(),
      cupPrice: req.body.cupPrice,
      cupCapacity: parseInt(req.body.cupCapacity),
      numberOfCups: req.body.numberOfCups,
      cupsAvailable: req.body.numberOfCups,
      currency: req.body.currency.toLowerCase(),
      loyaltyPoints: req.body.loyalityPoint,
      isCupAvailable: true,
      returnTime: req.body.returnTime? parseInt(req.body.returnTime) : 30,
      cupImages: [],
    });

    // e.1) Condition: If image is provided
    if (req.files) {
      let tempImages = [];
      if (typeof req.files.file == "object") tempImages.push(req.files.file);
      else tempImages = req.files.file;

      // e.1.1) Compressing Images
      await utilsMiddleware
        .utilsUploadMultipleImages(tempImages)
        .then((data) => {
          resizedImage = data;
        });

      // e.1.2) Saving images
      let folderName = req.body.cupType.toLowerCase().split(" ").join("");
      for (let i = 0; i < resizedImage.length; i++) {
        const myCloud = await cloudinary.v2.uploader.upload_stream(
          { folder: `cupInventory/${folderName}` },
          async function (err, image) {
            let temp = {
              public_id: image.public_id,
              url: image.url,
            };
            cupInventory.cupImages.push(temp);
            uploadLenCheck += 1;
            if (uploadLenCheck === resizedImage.length) {
              // e.1.2.1) Saving details in databse
              await cupInventory.save();

              // e.1.2.2) Sending response
              res.status(200).json({
                success: true,
                message: "Cup Inventory updated",
              });
            }
          }
        );
        // e.1.3) Creating stream pipe for saving images in patches
        streamifier.createReadStream(resizedImage[i].data).pipe(myCloud);
      }
    }
    // e.2) Condition: If image is not provided
    else {
      // e.2.1) Setting default image if image not provided
      let temp = {
        public_id: "default/oufv5uavr0ov5y7i9rmh",
        url: "http://res.cloudinary.com/dva7hs5oo/image/upload/v1697439751/default/oufv5uavr0ov5y7i9rmh.jpg",
      };
      // e.2.2) Saving default image for a cup
      cupInventory.cupImages.push(temp);
      await cupInventory.save();

      // ) e.2.3) Sending response
      res.status(200).json({
        success: true,
        message: "Cup Inventory updated",
      });
    }
  }
);

// 02) ADMIN: All cups in inventory
exports.projectName_Admin_All_Cups_In_Inventory = CatchAsync(
  async (req, res, next) => {
    // a) Fetching all cups in inventory
    const cupsInInventory = req.query.keyword
      ? await CupInventory.find({
        cupType: { $regex: req.query.keyword.toLowerCase() },
      })
      : await CupInventory.find()
        .select("+cupsAvailable +returnTime")
        .sort({ createdAt: -1 });
    if (cupsInInventory.length === 0 || !cupsInInventory)
      return next(new ErrorHandler(`No data found`, 200));

    // b) Sending response
    cupsResponses.cupsInInventoryResponse(res, 200, cupsInInventory, true, 2);
  }
);

// 03) ADMIN: Cups details upload
exports.projectName_Admin_Cup_Inventory_Update = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring information
    const cupID = req.params.id;

    // b) Checking if data exist
    const isCupExist = await CupInventory.findById({ _id: cupID }).select("+returnTime").catch(
      (err) => {
        return next(new ErrorHandler(`Something went wrong`, 404));
      }
    );
    if (!isCupExist)
      return next(new ErrorHandler(`Cup details not found`, 200));

    isCupExist.cupCapacity = req.body.cupCapacity ? parseInt(req.body.cupType.cupCapacity) : isCupExist.cupCapacity;
    isCupExist.cupPrice = req.body.cupPrice ? parseInt(req.body.cupPrice) : isCupExist.cupPrice;
    isCupExist.currency = req.body.currency ? req.body.currency.toLowerCase() : isCupExist.currency.toLowerCase();
    isCupExist.isCupAvailable = req.body.isCupAvailable ? req.body.isCupAvailable : isCupExist.isCupAvailable;
    isCupExist.returnTime = req.body.returnTime ? parseInt(req.body.returnTime) : isCupExist.returnTime;
    if (req.body.numberOfCups) {
      if (isCupExist.numberOfCups) {
        isCupExist.numberOfCups += parseInt(req.body.numberOfCups)
      } else {
        isCupExist.numberOfCups = parseInt(req.body.numberOfCups)
      }
    }
    const availModel = await CupAvailable.findOne({ modelID: isCupExist.cupModelUniqueId })
    if (req.body.cupType && availModel) {
      isCupExist.cupType = req.body.cupType.toLowerCase()
      availModel.cupType = req.body.cupType.toLowerCase()
    }
    if (req.body.cupSize && availModel) {
      isCupExist.cupSize = req.body.cupSize.toLowerCase()
      availModel.cupSize = req.body.cupSize.toLowerCase()
    }
    if (availModel) await availModel.save()
    await isCupExist.save();

    // ) Sending response
    res.status(200).json({
      success: true,
      message: "Cup Inventory updated",
    });
  }
);

// 04) ADMIN: Cups Category Price and loyalty point update
exports.projectName_Admin_Cup_Price_Update_In_Inventory = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring data
    const cupID = req.params.id;

    // b) Fetching cup and updating price
    let isUpdated = true;

    const cupInventory = await CupInventory.findById({ _id: cupID }).catch(
      (err) => (isUpdated = false)
    );

    cupInventory.cupPrice = req.body.cupPrice
      ? req.body.cupPrice
      : cupInventory.cupPrice;
    cupInventory.loyaltyPoints = req.body.loyaltyPoints
      ? req.body.loyaltyPoints
      : cupInventory.loyaltyPoints;
    await cupInventory.save();

    if (!isUpdated) return next(new ErrorHandler(`Something went wrong`, 200));

    // ) Sending response
    res.status(200).json({
      success: true,
      message: "Cup data updated successfully.",
    });
  }
);

// 05) ADMIN: Cup availability update
exports.projectName_Admin_Cup_Availability_Status_Update = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring data
    const cupID = req.params.id;

    // b) Fetching cup details
    const cupInventory = await CupInventory.findById({ _id: cupID }).catch(
      (err) => {
        return next(new ErrorHandler(`Something went wrong`, 404));
      }
    );
    if (!cupInventory) return next(new ErrorHandler(`No data found`, 200));

    // c) Changing status of availibility
    if (cupInventory.isCupAvailable) cupInventory.isCupAvailable = false;
    else if (!cupInventory.isCupAvailable) cupInventory.isCupAvailable = true;
    await cupInventory.save();

    // ) Sending response
    res.status(200).json({
      success: true,
      message: `Cup is made ${cupInventory.isCupAvailable ? "available." : "not available."
        }`,
    });
  }
);

// 06) ADMIN: CSV file generation
exports.projectName_Generating_Cup_CSV_file = CatchAsync(
  async (req, res, next) => {
    // a) Variable Declaration
    let requestSize = 0;

    // b) Destructuring data from request body and checking if it is provided
    const { cupData } = req.body;
    if (cupData.length === 0) {
      return next(new ErrorHandler(`Please provide all details`, 400));
    }

    // c) Generating Unique IDs
    for (let i = 0; i < cupData.length; i++) {
      let modelID;
      if (!cupData[i].cupType || !cupData[i].cupSize) {
        return next(new ErrorHandler(`Please provide all details`, 400));
      }
      requestSize += parseInt(cupData[i].numberOfCups);
      if (requestSize > 99999) {
        return next(
          new ErrorHandler(
            `Please request for less than 100k cups at once.`,
            400
          )
        );
      }

      const cupModelExist = await CupAvailable.findOne({
        cupType: cupData[i].cupType.toLowerCase(),
        cupSize: cupData[i].cupSize.toLowerCase(),
      });

      if (cupModelExist) {
        modelID = cupModelExist.modelID;
      } else {
        const temp = await generateUniqueIDForCups();
        modelID = temp.toUpperCase();
        await CupAvailable.create({
          cupType: cupData[i].cupType.toLowerCase(),
          cupSize: cupData[i].cupSize.toLowerCase(),
          modelID: modelID,
        });
      }
    }

    // f) Sending response
    res.status(200).json({
      success: true,
      message: "Models Generated Successfully",
    });
  }
);

// 07) ADMIN: All CSV files generated
exports.projectName_All_Generated_Cup_CSV_files = CatchAsync(
  async (req, res, next) => {
    // a) Fetching all data
    const resultPerPage = 2;

    // Product count for frontend to show
    const fileCount = await CSVData.countDocuments();

    const apiFeature = new ApiFeatures(CSVData.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);
    const cupsData = await apiFeature.query;
    // const cupsData = await CSVData.find().catch((err)=>{
    //     return next(new ErrorHandler(`Something went wrong`, 400));
    // })

    // e) Checking if data is saved successfully or not
    if (cupsData.length === 0) {
      return next(new ErrorHandler(`Something went wrong`, 400));
    }

    // f) Sending response
    res.status(200).json({
      success: true,
      message: "All file Generated!",
      fileCount,
      cupJson: cupsData,
    });
  }
);

// 10) ADMIN: Dashboard Information
exports.projectName_Admin_Get_DashBoard_Information = CatchAsync(
  async (req, res, next) => {
    // Variable Declaration
    // Response object
    let tempNCups = 0;
    let adminData = {
      cups: 0,
      customers: 0,
      vendors: 0,
      cupRequests: 0,
    };

    // Cup Data
    const tempCups = await CupInventory.find();

    if (tempCups.length > 0) {
      tempCups.forEach((data) => {
        tempNCups += data.numberOfCups;
      });
    }

    // Customers data
    const customers = await Customers.find();

    // Vendors data
    const vendors = await Vendors.find();

    // Requested Cups
    const cupRequests = await CupStockRequest.find();

    // Data assingments
    adminData.cups = tempNCups;
    adminData.customers =
      !customers || customers.length === 0 ? 0 : customers.length;
    adminData.vendors = !vendors || vendors.length === 0 ? 0 : vendors.length;
    adminData.cupRequests = !cupRequests ? 0 : cupRequests.length;

    res.status(200).json({
      success: true,
      message: "All informtion",
      adminData,
    });
  }
);

// 11) Admin: Fetching all cups available
exports.projectName_Admin_Fetching_All_Available_Cup = CatchAsync(
  async (req, res, next) => {
    const cupAvailable = await CupAvailable.find();
    if (cupAvailable.length === 0 || !cupAvailable) {
      return res.status(200).json({
        success: false,
        message: `No data found`,
      });
    }

    const tempArray = [];
    const responseData = {};
    for (let i = 0; i < cupAvailable.length; i++) {
      let temp = cupAvailable[i].cupType.toString().toLowerCase();
      if (!tempArray.includes(temp)) {
        tempArray.push(temp);
        responseData[`${temp}`] = [];
      }
    }
    for (let j = 0; j < tempArray.length; j++) {
      for (let i = 0; i < cupAvailable.length; i++) {
        let temp = cupAvailable[i].cupType.toString().toLowerCase();
        if (tempArray[j] === temp) {
          let tmpData = {
            _id: cupAvailable[i]._id,
            modelID: cupAvailable[i].modelID,
            cupSize:
              cupAvailable[i].cupSize.charAt(0).toUpperCase() +
              cupAvailable[i].cupSize.slice(1),
          };
          responseData[`${tempArray[j]}`].push(tmpData);
        }
      }
    }

    const finalData = Object.keys(responseData).map((data) => {
      const tempKey = data.charAt(0).toUpperCase() + data.slice(1);
      const tempVal = responseData[data];
      return [tempKey, tempVal];
    });

    res.status(200).json({
      success: false,
      message: `Available cups`,
      cupAvailable: finalData,
    });
  }
);

// 12) Admin: Adding Cup
exports.projectName_Admin_Adding_New_Scanned_Cup_In_DB = CatchAsync(
  async (req, res, next) => {
    // Destructuring request header
    const { modelID, cupID } = req.body;
    // Checking if cup exist
    const existingCup = await Cups.findOne({
      // cupModelUniqueId: modelID.toUpperCase(),
      cupUniqueId: cupID.split(":").join("").toUpperCase(),
    });

    if (existingCup) {
      return next(new ErrorHandler(`Cup already been added`, 400));
    }

    const fetchingCupID = await CupInventory.findOne({
      cupModelUniqueId: modelID.toUpperCase(),
    });

    if (!fetchingCupID) {
      return next(new ErrorHandler(`Invalid Cup Modal`, 400));
    }

    const cupData = await Cups.create({
      cupID: fetchingCupID._id,
      cupModelUniqueId: modelID.toUpperCase(),
      cupUniqueId: cupID.split(":").join("").toUpperCase(),
      cupBoughtHistory: [],
    });

    res.status(200).json({
      success: true,
      message: "Cup added successfully",
      cupData,
    });
  }
);

// 13) ADMIN: Cups Category Price and loyalty point update
exports.projectName_Admin_Cup_Details_Delete_In_Inventory = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring data
    const cupID = req.params.id;

    const cupInventory = await CupInventory.findByIdAndDelete({ _id: cupID })
      .catch((err) => { });

    if (!cupInventory) {
      return res.status(200).json({
        success: true,
        message: `Cup already been deleted!`
      })
    }

    // ) Sending response
    res.status(200).json({
      success: true,
      message: "Cup detail has been deleted successfully.",
    });
  }
);

// 14) ADMIN: projectName_Admin_All_Available_Cups_List
exports.projectName_Admin_All_Available_Cups_List = CatchAsync(
  async (req, res, next) => {

    const cupsAvailable = await Cups.find({ isActive: true })
      // .select('cupID cupModelUniqueId cupUniqueId')
      .populate('cupID', 'cupSize cupType')
      .catch((err) => { });

    if (!cupsAvailable) {
      return next(new ErrorHandler('No data dound', 404))
    }

    // ) Sending response
    res.status(200).json({
      success: true,
      message: "All available cups.",
      length: cupsAvailable.length,
      cups: cupsAvailable
    });
  }
);

// 15)
exports.projectName_Admin_Disable_Available_Cups = CatchAsync(
  async (req, res, next) => {

    // Destructuring data
    const { cupID } = req.body

    const cupsAvailable = await Cups.findOne({ cupID: cupID })
      .select('cupID cupModelUniqueId cupUniqueId +isActive')
      .populate('cupID', 'cupSize cupType')
      .catch((err) => { });

    if (!cupsAvailable) {
      return next(new ErrorHandler('No data dound', 404))
    }

    if (!cupsAvailable.isActive) {
      return res.status(200).json({
        success: true,
        message: `Cup already been deleted!`
      })
    }
    else {
      cupsAvailable.isActive = false
      cupsAvailable.isOrderable = false
      await cupsAvailable.save();
    }

    // ) Sending response
    res.status(200).json({
      success: true,
      message: "Cup deleted successfully!.",
    });
  }
);

const formattingRequestBody = async function (avlCup, prdCup) {

  let tempData = [];
  let tempAvlCup = []
  const uniqueObject = {};

  // Use the filter method to filter out duplicate objects based on the concatenated key value
  const providedData = prdCup.filter(obj => {
    let isTemp = "" + obj.cupID;
    const key = isTemp + ":" + obj.cupSize + ":" + obj.cupType;
    if (!uniqueObject[key]) {
      uniqueObject[key] = true;
      return true;
    }
    return false;
  });

  providedData.forEach((data) => {
    let isExist = false;
    for (let i = 0; i < avlCup.length; i++) {
      let isCupType = avlCup[i].cupType.toString().toLowerCase() === data.cupType.toString().toLowerCase();
      let isCupSize = avlCup[i].cupSize.toString().toLowerCase() === data.cupSize.toString().toLowerCase();
      if (isCupType && isCupSize) {
        isExist = true;
        let temp = {
          modelID: avlCup[i].modelID,
          cupType: data.cupType.toLowerCase(),
          cupSize: data.cupSize.toLowerCase(),
          cupID: data.cupID.toUpperCase()
        }
        tempData.push(temp)
        break
      }
    }
    if (!isExist) {
      const mdID = generateUniqueIDForCups();
      let temp = {
        modelID: mdID.toUpperCase(),
        cupType: data.cupType.toLowerCase(),
        cupSize: data.cupSize.toLowerCase(),
        cupID: data.cupID.toUpperCase()
      }
      tempData.push(temp);
      tempAvlCup.push(temp)
    }
  })


  let result = {
    formatData: tempData,
    filterAvlCup: tempAvlCup,
  }
  return result;
}

const inventoryCupFilter = async function (avlCup, prdCup) {

  let result = {
    newCups: [],
    avlCups: []
  }

  prdCup.forEach((data) => {
    if (avlCup.length > 0) {
      result.avlCups = avlCup;
      let isNew = false;
      for (let i = 0; i < result.avlCups.length; i++) {
        if (data.modelID === result.avlCups[i].cupModelUniqueId) {
          result.avlCups[i].cupsAvailable += 1;
          result.avlCups[i].numberOfCups += 1;
          isNew = true;
          break;
        }
      } if (!isNew) {
        let temp = {
          cupModelUniqueId: data.modelID,
          cupType: data.cupType,
          cupSize: data.cupSize,
          cupsAvailable: 1,
          numberOfCups: 1,
        }
        result.newCups.push(temp)
      }
    } else {
      if (result.newCups.length == 0) {
        let temp = {
          cupModelUniqueId: data.modelID,
          cupType: data.cupType,
          cupSize: data.cupSize,
          cupsAvailable: 1,
          numberOfCups: 1,
        }
        result.newCups.push(temp);
      } else {
        let isCupExist = false;
        for (let i = 0; i < result.newCups.length; i++) {
          if (result.newCups[i].cupModelUniqueId === data.modelID) {
            result.newCups[i].numberOfCups += 1;
            result.newCups[i].cupsAvailable += 1;
            isCupExist = true;
            break
          }
        }
        if (!isCupExist) {
          let temp = {
            cupModelUniqueId: data.modelID,
            cupType: data.cupType,
            cupSize: data.cupSize,
            cupsAvailable: 1,
            numberOfCups: 1,
          }
          result.newCups.push(temp)
        }
      }
    }
  })
  return result;
}
// Function to filter objects from the secondary array not present in the main array
const filterSecondaryArray = (mainArray, secondaryArray) => {
  return secondaryArray.filter(secondaryObj => {
    return !mainArray.some(mainObj => mainObj.cupModelUniqueId === secondaryObj.cupModelUniqueId && mainObj.cupUniqueId === secondaryObj.cupUniqueId);
  });
};

const updatedUserCupsFilter = async function (inventory, cups, tempData) {
  let updatedData = tempData.map((data) => {
    let temp = {
      cupID: undefined,
      cupModelUniqueId: data.modelID.toUpperCase(),
      cupUniqueId: data.cupID.toUpperCase(),
    }
    for (let j = 0; j < inventory.length; j++) {
      if(inventory[j].cupModelUniqueId === data.modelID){
        temp.cupID = inventory[j]._id;
        break;
      }
    }
    return temp;
  })
  
  let result = filterSecondaryArray(cups, updatedData)
  return result;
}


exports.projectName_Upload_Cup_Details_Using_CSV_Data = CatchAsync(async (req, res, next) => {

  // Destructuring Data from request header
  const { uploadedCSV } = req.body;
  if (!uploadedCSV) {
    return res.status(400).json({
      success: false,
      message: `Please provide a csv file!`
    })
  }

  let csvData = uploadedCSV;

  // Checking length of input
  if (csvData.length > 1000) {
    return res.status(400).json({
      success: false,
      message: `Please provide less data then 1000!`
    })
  }

  const availableCups = await CupAvailable.find();
  const inventoryCups = await CupInventory.find().select("+cupsAvailable");
  const isCups = await Cups.find()

  const avlFormattedData = await formattingRequestBody(availableCups, csvData);
  const uniqueObject = {};
  // Use the filter method to filter out duplicate objects based on the concatenated key value
  const providedData = avlFormattedData.filterAvlCup.filter(obj => {
    const key = obj.cupSize + obj.cupType;
    if (!uniqueObject[key]) {
      uniqueObject[key] = true;
      return true;
    }
    return false;
  });
  await CupAvailable.insertMany(providedData);

  const inventoryFormattedData = await inventoryCupFilter(inventoryCups, avlFormattedData.formatData);

  await CupInventory.insertMany(inventoryFormattedData.newCups);
  for (const { _id, cupsAvailable, numberOfCups } of inventoryFormattedData.avlCups) {
    await CupInventory.updateOne({ _id }, { $set: { cupsAvailable, numberOfCups } });
  }
  const isinventoryCups = await CupInventory.find();

  const newCups = await updatedUserCupsFilter(isinventoryCups, isCups, avlFormattedData.formatData);
  if(newCups.length!==0){
    await Cups.insertMany(newCups)
  }

  // Sending response
  res.status(200).json({
    success: true,
    message: "Cups Uploaded Successfully!",
  });
});