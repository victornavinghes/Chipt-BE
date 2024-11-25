// BuiltIn Module Import

// Created middleware Import
const CatchAsync = require('../../errors/catchAsync.js');
const ErrorHandler = require('../../utils/errorHandler.js');
const { storeStockResponse, cupsResponses } = require('../../utils/responseObjects.js');
const ApiFeatures = require('../../utils/apiFeatures.js');

// Database Import 
const Cups = require('../../models/Cups/Cup.js');
const Vendors = require('../../models/Vendors/Vendor.js');
const StoreCupsStock = require('../../models/Vendors/StoreCupsStock.js');
const CupInventory = require('../../models/Cups/CupInventory.js');


/*
    Index:
        01) All vendors list
        02) Single vendor details
        03) Vendor store available cups
        04) Vendor store cup details
*/

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;

    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadiusKm * c;
    return distance;
}

// 01) ✅ CUSTOMER: All vendors list
exports.projectName_Customer_All_Vendors_List = CatchAsync(async (req, res, next) => {

    // Declaration Of variables
    // Filter Query
    console.log(req.body)
    let filterQuery = {
        accountActive: true,
        accountVerified: true,
    }
    let userLocation = undefined
    if (req.body && req.body.latitude && req.body.longitude){
        const { latitude, longitude } = req.body;
        if(!latitude || !longitude){
            return res.status(400).json({
                success: false, 
                message: `Please provide location!`
            })
        }
        userLocation = [latitude, longitude];
        filterQuery.location = {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                // $maxDistance: maxDistance // Maximum distance in meters
            }
        }
    }

    // Data count for frontend to show
    const apiFeature = new ApiFeatures(Vendors.find(filterQuery)
            .select("name primaryEmail username profilePicture +accountActive plotnumber address city +state +country +zipCode location")
            .sort({ createdAt: -1 }), req.query)
        .search()
        .filter()
    const isVendors = await apiFeature.query;

    // Calculate distance between current user and each store
    const vendors = isVendors.map(vendor => {
        let temp = {
            _id: vendor._id,
            accountActive: vendor.accountActive,
            username: vendor.username,
            name: vendor.name,
            primaryEmail: vendor.primaryEmail,
            profilePicture: vendor.profilePicture,
            location: vendor.location.coordinates,
            plotnumber: vendor.plotnumber,
            address: vendor.address,
            city: vendor.city,
            state: vendor.state,
            country: vendor.country,
            zipCode: vendor.zipCode,
            distance: undefined
        }
        if(req.body && req.body.latitude && req.body.longitude){
            const distance = calculateDistance(userLocation[0], userLocation[1], vendor.location.coordinates[1], vendor.location.coordinates[0]);
            temp.distance = (distance/1000).toFixed(2) + " km"
        }

        return temp
    });

    // Sort vendors by distance
    vendors.sort((a, b) => a.distance - b.distance);

    // c) Sending response
    res.status(200).json({
        success: true,
        message: 'Active vendors',
        vendors
    })
})

// 02) ✅ CUSTOMER: Single vendor details
exports.projectName_Customer_Single_Vendor_Information = CatchAsync(async (req, res, next) => {

    // a) Fetching vendors information
    const vendor = await Vendors.findById({ _id: req.params.vid })
        .catch((err) => {
            return next(new ErrorHandler(`Something went wrong`, 404));
        })

    // b) Checking if data exist
    if (!vendor) {
        return next(new ErrorHandler(`No data found`, 200));
    }

    // c) Sending response
    res.status(200).json({
        success: true,
        message: 'Vendor profile data',
        vendor
    })
})

// 03) ✅ CUSTOMER: Vendor store available cups
exports.projectName_Customer_Vendor_Store_Stock_Information = CatchAsync(async (req, res, next) => {

    // a) Fetching vendors information
    const vendor = await Vendors.findById({ _id: req.params.vid })
        .select("name primaryEmail profilePicture +countryCode +primaryContactNumber +plotnumber +address +city +country +zipCode storeImages +storeCupsStock")
        .catch((err) => {
            return next(new ErrorHandler(`Something went wrong`, 404))
        })

    // b) Checking if vendor exist
    if (!vendor) return next(new ErrorHandler(`No data found`, 200));

    // c) Checking if vendor stock exist
    let existStock = true
    const vendorStock = await StoreCupsStock.findById({ _id: vendor.storeCupsStock })
        .populate('cups.cupID')
        .catch((err) => {
            existStock = false
        })

    // d) Sending response
    if (!vendorStock) storeStockResponse.vendorStoreStockByCustomer(res, 200, vendor, false);
    else storeStockResponse.vendorStoreStockByCustomer(res, 200, vendor, vendorStock);

})

// 04) CUSTOMER: Particular Cup Details
exports.projectName_Customer_Single_Cup_Details_After_Scan = CatchAsync(async (req, res, next) => {

    let isHistory;
    let cupHistry;
    const { uniqueId, modelId } = req.body;

    const isCupHistoryAvailable = await Cups.findOne({ cupUniqueId: uniqueId, cupModelUniqueId: modelId })
        .populate('lastVendor', '+name')
        .populate('currentVendor', '+name')
        .populate('currentCustomer', '+firstname +middlename +lastname');

    if (!isCupHistoryAvailable) {
        isHistory = false
        cupHistry = 'No history found.'
    } else {
        isHistory = true
        cupHistry = isCupHistoryAvailable
    }

    const cupModelDetails = await CupInventory.findOne({ cupModelUniqueId: modelId })
        .select("cupModelUniqueId cupSize cupType cupCapacity cupPrice currency cupImages description");


    if (!isCupHistoryAvailable && !cupModelDetails) {
        return next(new ErrorHandler(`Something went wrong`, 404))
    }

    cupsResponses.coffeeCupHistoryResponse(res, 200, cupModelDetails, cupHistry, isHistory);
})