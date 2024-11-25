// BuiltIn Module Import

// Database Import 
const Admins = require('../../models/Admin/Admin.js');
const CupInventory = require('../../models/Cups/CupInventory.js');
const Cups = require('../../models/Cups/Cup.js');
const Order = require('../../models/Orders/Order.js');

// User Created Module Import
const CatchAsync = require('../../errors/catchAsync.js');
const ErrorHandler = require('../../utils/errorHandler.js');
const { cupsResponses, scannedCupResponse } = require('../../utils/responseObjects.js');


/*
    Index:
        01) Available Cups in inventory
        02) Unavailable Cups in inventory
        03) Cup details in inventory
        04) Cup data after scan
        00) Cup user detagging from customer and assining to current vendor by updating stock
*/

// 01) UTILS: Available Cups in inventory
exports.projectName_Admin_Vendor_Cup_Available_Cups_In_Inventory = CatchAsync(async (req, res, next) => {

    // a) Fetching cup details
    const cupInventory = await CupInventory.find({ isCupAvailable: true }).select('+returnTime')
    if (!cupInventory || cupInventory.length === 0) return next(new ErrorHandler(`No data found`, 200))

    // b) Sending response
    // cupsResponses.cupInInventoryResponse(res, statusCode, cupInventory, isList, isAvailable)
    cupsResponses.cupsInInventoryResponse(res, 200, cupInventory, true, true)
})

// 02) UTILS: Unavailable Cups in inventory
exports.projectName_Admin_Vendor_Cup_Not_Available_Cups_In_Inventory = CatchAsync(async (req, res, next) => {

    // a) Fetching cup details
    const cupInventory = await CupInventory.find({ isCupAvailable: false }).select("+returnTime")
    if (!cupInventory || cupInventory.length === 0) return next(new ErrorHandler(`No data found`, 200))

    // b) Sending response
    // cupsResponses.cupInInventoryResponse(res, statusCode, cupInventory, isList, isAvailable)
    cupsResponses.cupsInInventoryResponse(res, 200, cupInventory, true, false)
})

// 03) UTILS: Cup details in inventory
exports.projectName_Admin_Vendor_Cup_Details_Available_In_Inventory = CatchAsync(async (req, res, next) => {

    // a) Fetching Cup id
    const cupID = req.params.id
    const user = await Admins.findById({ _id: req.user.id })

    // b) Fetching cup details
    let cupInventory;
    if (user) {
        cupInventory = await CupInventory.findById({ _id: cupID })
            .select("+cupsAvailable +returnTime")
            .catch((err) => { return next(new ErrorHandler(`Something went wrong`, 404)) })
    } else {
        cupInventory = await CupInventory.findById({ _id: cupID })
            .catch((err) => { return next(new ErrorHandler(`Something went wrong`, 404)) })
    }

    if (!cupInventory) return next(new ErrorHandler(`No data found`, 200))

    // c) Sending response
    // cupsResponses.cupInInventoryResponse(res, statusCode, cupInventory, isList, isAvailable)
    cupsResponses.cupsInInventoryResponse(res, 200, cupInventory, false, false)
})

// 04) UTILS: Cup data after scan
exports.projectName_Cup_Details_After_NFC_Scanned = CatchAsync(async (req, res, next) => {

    // a) Destructuring cup Model and Unique ID's
    let returnCondition = false;
    let returning_time = Date.now() - 170000000;
    const { modelID, uniqueID } = req.body;

    // b) Fetching cup detail using model ID
    const cupDetails = await CupInventory.findOne({ cupModelUniqueId: modelID })
        .select('cupModelUniqueId cupSize cupType cupCapacity cupPrice currency cupImages loyaltyPoints');

    // c) Fetching cup order history by unique ID
    const cupOrderHistory = await Cups.findOne({ cupModelUniqueId: modelID, cupUniqueId: uniqueID });

    if (!cupDetails) {
        return res.status(404).json({
            success: false,
            message: 'No data found'
        })
    }

    // Checking if cup is returnable by customer who scanned it
    // Updated part start
    const order = await Order.findOne({
        customer: cupOrderHistory.currentCustomer,
        cupModelUniqueId: modelID,
        cupUniqueId: uniqueID,
    }).select('+returnedVendor +isReturned');

    if (!order) {
        returnCondition = false;
    } else {
        if (order.isReturned) {
            returnCondition = false
        } else {
            if (order.orderTime < returning_time) {
                if (cupOrderHistory.currentCustomer.toString() === req.user.id.toString() && !cupOrderHistory.isOrderable) {
                    returnCondition = true;
                }
            }
        }
    }

    // Updated part end
    if (!cupOrderHistory) scannedCupResponse.cupDetailsAfterCupScan(res, 200, cupDetails, false, uniqueID, returnCondition)
    else scannedCupResponse.cupDetailsAfterCupScan(res, 200, cupDetails, cupOrderHistory, uniqueID, returnCondition)
})

// 05) UTILS: Cup return and detagging
exports.projectName_Cup_Return_And_Detagging_By_Customer = CatchAsync(async (req, res, next) => {
    
    // Destructuring data
    
});