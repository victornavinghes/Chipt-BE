// BuiltIn Module Import

// Database Import 
const Vendors = require('../../models/Vendors/Vendor.js');
const Customers = require('../../models/Customer/Customer.js');
const CupOrders = require('../../models/Orders/Order.js');
const StoreCupsStock = require('../../models/Vendors/StoreCupsStock.js');
const CupStockRequest = require('../../models/Vendors/CupStockRequest.js');
const CupInventory = require('../../models/Cups/CupInventory.js');

// User Created Module Import
const CatchAsync = require('../../errors/catchAsync.js');
const ErrorHandler = require('../../utils/errorHandler.js');

/*
    Index:
        01) New stock request
        02) Store Stock Update
        03) Update store stock after delivery
        04) Dashboard Information
*/


// Stock reduction function
async function reduce_stock(cid, nmber) {
    const inventoryCup = await CupInventory.findOne({ cupModelUniqueId: cid })
    let tempNmber = inventoryCup.numberOfCups - nmber
    inventoryCup.numberOfCups = tempNmber
    await inventoryCup.save();
}

function checkingIFCupExist(cupsExist, checkCup) {
    for (let i = 0; i < cupsExist.length; i++) {
        let idCheck = cupsExist[i].cupModelUniqueId.toString().toUpperCase()
        let idType = checkCup.cupModelUniqueId.toString().toUpperCase()
        if (idCheck === idType) {
            return true
        }
    }
    return false
}

// 01) VENDOR: New stock request
exports.projectName_Vendor_Store_New_Cup_Stock_Request = CatchAsync(async (req, res, next) => {

    // a) Destructuring data
    const vendorID = req.user.id;
    const { cupsRequested } = req.body;
    const requestCups = [];

    // b) Fetching stock information
    const vendor = await Vendors.findById({ _id: vendorID })
        .select("primaryEmail +accountActive plotnumber address city state country zipCode countryCode primaryContactNumber +cupStockRequests");

    if (!vendor.plotnumber || !vendor.address || !vendor.city || !vendor.state || !vendor.country || !vendor.zipCode) {
        return next(new ErrorHandler("Please provide shipping address or update your store address first", 400))
    }

    // c) Checking for error and if requested cups is avaiable or not
    const isRequestedCupsAvailable = await CupInventory.find({ isCupAvailable: true }).select('+cupsAvailable');

    for (let i = 0; i < cupsRequested.length; i++) {
        if (!cupsRequested[i].cupModelUniqueId || !cupsRequested[i].numberOfCups) {
            return next(new ErrorHandler(`Please provide all details`, 200));
        }

        let isCupSizeAvailable = checkingIFCupExist(isRequestedCupsAvailable, cupsRequested[i]);

        if (!isCupSizeAvailable) {
            return next(new ErrorHandler(`${cupsRequested[i].cupType.charAt(0).toUpperCase() + cupsRequested[i].cupType.slice(1)} is unavailable.`, 200))
        }

        for (let j = 0; j < isRequestedCupsAvailable.length; j++) {
            if (isRequestedCupsAvailable[j].cupModelUniqueId === cupsRequested[i].cupModelUniqueId) {
                if (!isRequestedCupsAvailable[j].numberOfCups) {
                    return next(new ErrorHandler(`Something went wrong`, 400));
                }
                else if (isRequestedCupsAvailable[j].numberOfCups < parseInt(cupsRequested[i].numberOfCups)) {
                    return next(new ErrorHandler(`${cupsRequested[i].cupType.charAt(0).toUpperCase() + cupsRequested[i].cupType.slice(1)} is not enough in inventory so request less than available number.`, 200));
                } else {
                    let temp = {
                        cupID: isRequestedCupsAvailable[j]._id,
                        numberOfCups: cupsRequested[i].numberOfCups
                    }
                    requestCups.push(temp);
                    reduce_stock(cupsRequested[i].cupModelUniqueId, cupsRequested[i].numberOfCups)
                }
            }
        }
    }

    let vendorRequest;
    if (requestCups.length >= 1) {

        vendorRequest = await CupStockRequest.create({
            vendor: req.user.id,
            cupsRequested: requestCups,
            shippingAddress: {
                plotnumber: req.body.shippingAddress ? req.body.shippingAddress.plotnumber : vendor.plotnumber,
                address: req.body.shippingAddress ? req.body.shippingAddress.address : vendor.address,
                city: req.body.shippingAddress ? req.body.shippingAddress.city : vendor.city,
                state: req.body.shippingAddress ? req.body.shippingAddress.state : vendor.state,
                country: req.body.shippingAddress ? req.body.shippingAddress.country : vendor.country,
                zipCode: req.body.shippingAddress ? req.body.shippingAddress.zipCode : vendor.zipCode,
            },
            countryCode: req.body.countryCode ? req.body.countryCode : vendor.countryCode,
            contactNumber: req.body.countryCode ? req.body.countryCode : vendor.primaryContactNumber,

        })
            // .catch((err) => { return next(new ErrorHandler(`Something went wrong`, 404)) })
    }

    // e) Saving reference in vendor
    vendor.cupStockRequests.push(vendorRequest._id)
    await vendor.save()

    // f) Sending response
    res.status(200).json({
        success: true,
        message: 'Request generated',
    })
})

// 02) VENDOR: Update store stock after delivery
exports.projectName_Vendor_Updating_Vendor_Store_Stock = CatchAsync(async (req, res, next) => {

    // a) Destructuring request ID from params
    const vendorID = req.user.id;
    const stockRequestId = req.params.rid

    // b) Fetching admin cup inventory and stock request details and checking if they exist
    const adminCupInventory = await CupInventory.find()
    const cupRequest = await CupStockRequest.findById({ _id: stockRequestId })
        .select("+requestStatus +isDeliveryConfirm")
        .populate('vendor', 'name primaryEmail')
        .populate('cupsRequested.cupID', '_id cupModelUniqueId oneCupPrice')
        .catch((err) => {
            return next(new ErrorHandler(`Something went wrong`, 404))
        });
    if (!cupRequest) {
        return next(new ErrorHandler(`No cup stock request exsit`, 200))
    }

    // c) Checking if requests is pending or dispatched or rejected
    if(cupRequest.isDeliveryConfirm){
        return next(new ErrorHandler(`Stock already been updated.`, 200))
    }
    if (cupRequest.approvalStatus === "STATUS_PENDING" && cupRequest.requestStatus === "PROCESSING") {
        return next(new ErrorHandler(`Request is pending.`, 200))
    }
    if (cupRequest.approvalStatus === 'STATUS_ACCEPTED' && cupRequest.requestStatus === 'DISPATCH') {
        return next(new ErrorHandler(`Request is accepted but pending fo delivery.`, 200))
    }
    if (cupRequest.approvalStatus === 'STATUS_ACCEPTED' && cupRequest.requestStatus === 'SHIPPED') {
        return next(new ErrorHandler(`Request is accepted but pending for delivery.`, 200))
    }
    if (cupRequest.approvalStatus === "STATUS_REJECTED" && cupRequest.requestStatus === "REJECTED") {
        return next(new ErrorHandler(`This request was rejected.`, 200))
    }

    // d) Preprocessing stock update data before saving in database in required schema 
    const preStoreData = cupRequest.cupsRequested.map((data) => {
        const cupID = data.cupID
        let temp;
        adminCupInventory.forEach((cupData) => {
            if (cupData.cupModelUniqueId === cupID.cupModelUniqueId) {
                temp = data
            }
        })
        return temp
    })

    // e) Saving data bor both if either vendor stock exist or not
    let vendorStock;
    const vendor = await Vendors.findById({ _id: vendorID })
        .select("+storeCupsStock primaryEmail")
        .catch((err) => {
            return next(new ErrorHandler(`Something went wrong`, 200))
        });
    if (!vendor.storeCupsStock) {
        vendorStock = await StoreCupsStock.create({
            vendor: vendor._id,
            primaryEmail: vendor.primaryEmail,
            cups: preStoreData
        })
        vendor.storeCupsStock = vendorStock._id
        await vendor.save();
    } else if (vendor.storeCupsStock) {
        vendorStock = await StoreCupsStock.findById({ _id: vendor.storeCupsStock })
            .catch((err) => {
                return next(new ErrorHandler(`Something went wrong`, 200))
            });

        // Condition filter vendor stock update
        for(let i=0; i<preStoreData.length; i++){
            let filterCupStock = false;
            for(let j=0; j<vendorStock.cups.length; j++){
                let predID = preStoreData[i].cupID._id.toString().toUpperCase()
                let vdID = vendorStock.cups[j].cupID.toString().toUpperCase()
                if(predID === vdID){
                    vendorStock.cups[j].numberOfCups += parseInt(preStoreData[i].numberOfCups);
                    filterCupStock = true;
                }
            }
            if(!filterCupStock){
                let temp = {
                    cupID: preStoreData[i].cupID._id,
                    numberOfCups:  preStoreData[i].numberOfCups
                }
                vendorStock.cups.push(temp)
            }
        }
        cupRequest.isDeliveryConfirm = true;
        await vendorStock.save();
        await cupRequest.save()
    }

    // f) Sending request
    res.status(200).json({
        success: true,
        message: `Stock updated`,
    })
});