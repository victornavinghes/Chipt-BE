// BuiltIn Module Import
const sharp = require('sharp');
const generateUniqueId = require('generate-unique-id');

// Database Import 
const Admin = require('../../models/Admin/Admin.js');
const Vendors = require('../../models/Vendors/Vendor.js');
const Customers = require('../../models/Customer/Customer.js');
const InAAPNotifications = require('../../models/Notification/InAppNotification.js');


// User Created Module Import

/*
    Middlerwares and Modules
        01) Checking if username is unique
        02) Checking if email address is unique
        03) Checking if user exist by provided email
        04) Unique ID generation for vendor store
        05) Unique username generation for vendor
        06) Unique ID generation for cups
        07) Profile image upload
        08) Gallery images upload
        09) Gallery image deleteion
        10) Unique Cup ID generations
*/


// 01) Checking if username is unique
exports.userUsernameExistanceCheck = async function (username) {
    // Fetching username from all category of users
    const adminCheckUsername = await Admin.findOne({ username: username })
    const vendorCheckUsername = await Vendors.findOne({ username: username })
    const customerCheckUsername = await Customers.findOne({ username: username })

    // if provided username exist so sending error response
    if (adminCheckUsername || vendorCheckUsername || customerCheckUsername) {
        return true
    }
    // if username doesn't exist so sending success response
    return false
}

// 02) Checking if email address is unique
exports.userEmailExistanceCheck = async function (email) {
    // Fetching username from all category of users
    const adminCheckEmail = await Admin.findOne({ primaryEmail: email })
    const vendorCheckEmail = await Vendors.findOne({ primaryEmail: email })
    const customerCheckEmail = await Customers.findOne({ primaryEmail: email })

    // if provided username exist so sending error response
    if (adminCheckEmail || vendorCheckEmail || customerCheckEmail) {
        return true
    }
    // if username doesn't exist so sending success response
    return false
}

// 03) Checking if user exist by provided email
exports.userContactExistanceCheck = async function (countryCode, contact) {
    // Fetching username from all category of users
    const adminCheckContact = await Admin.findOne({primaryContactNumber: contact })
    const vendorCheckContact = await Vendors.findOne({primaryContactNumber: contact })
    const customerCheckContact = await Customers.findOne({primaryContactNumber: contact })

    // if provided username exist so sending error response
    if (adminCheckContact || vendorCheckContact || customerCheckContact) {
        return true
    }
    // if username doesn't exist so sending success response
    return false
}

// 03) Checking if user exist by provided email
exports.userContactExistanceNoCodeCheck = async function (contact) {
    // Fetching username from all category of users
    const adminCheckContact = await Admin.findOne({ primaryContactNumber: contact })
    const vendorCheckContact = await Vendors.findOne({ primaryContactNumber: contact })
    const customerCheckContact = await Customers.findOne({ primaryContactNumber: contact })

    // if provided username exist so sending error response
    if (adminCheckContact || vendorCheckContact || customerCheckContact) {
        return true
    }
    // if username doesn't exist so sending success response
    return false
}

// 04) Unique ID generation for vendor store
exports.generateUniqueIDForVendors = function () {
    const registrationID = generateUniqueId({
        length: 11,
        useLetters: false,
        useNumbers: true,
        // includeSymbols: [''],
        excludeSymbols: [' ']
    });
    return registrationID
}

// 05) Unique username generation for vendor
exports.generateUniqueUsernameForVendors = function () {
    const registrationID = generateUniqueId({
        length: 7,
        useLetters: true,
        useNumbers: true,
        // includeSymbols: [''],
        excludeSymbols: [' ']
    });
    return registrationID
}

// 06) Unique ID generation for cups
exports.generateUniqueIDForCups = function () {
    const registrationID = generateUniqueId({
        length: 16,
        useLetters: true,
        useNumbers: true,
        excludeSymbols: [' ']
    });
    return registrationID
}

// 10) Unique Cup ID generations
exports.generateUniqueCupIDs = function () {
    const uniqueID = generateUniqueId({
        length: 9,
        useLetters: true,
        useNumbers: true,
        // includeSymbols: [''],
        excludeSymbols: [' ']
    });
    let returnID = uniqueID.toUpperCase();
    return returnID
}

// 07) Profile image upload
exports.utilsUploadProfileImage = async function(bufferData){

    const imageBuffer = await sharp(bufferData.data.buffer).resize({
        width: 1200,
        height: 1200,
        fit: sharp.fit.inside,
        withoutEnlargement: true
    }).toBuffer()
    let returnData = {
        name: bufferData.name,
        data: imageBuffer,
        size: imageBuffer.length,
        encoding: bufferData.encoding,
        tempFilePath: bufferData.tempFilePath,
        truncated: bufferData.truncated,
        mimetype: bufferData.mimetype,
        md5: bufferData.md5,
        mv: bufferData.mv

    }
    return returnData
}

// 08) Gallery images upload
exports.utilsUploadMultipleImages = async function(bufferData){

    let returnData = [];
    for(let i=0; i<bufferData.length; i++){
        const imageBuffer = await sharp(bufferData[i].data.buffer).resize({
            width: 1980,
            height: 1200,
            fit: sharp.fit.inside,
            withoutEnlargement: true
        }).toBuffer()
    
        let tempData = {
            name: bufferData[i].name,
            data: imageBuffer,
            size: imageBuffer.length,
            encoding: bufferData[i].encoding,
            tempFilePath: bufferData[i].tempFilePath,
            truncated: bufferData[i].truncated,
            mimetype: bufferData[i].mimetype,
            md5: bufferData[i].md5,
            mv: bufferData[i].mv
    
        }
        returnData.push(tempData)
    }

    return returnData
}


// In App Notification
exports.sendNotificationToUser = async (sendor, reciever, sendorID, recieverID, title, message)=>{
    if(sendor === 'admin' && reciever === 'vendor'){
        await InAAPNotifications.create({
            sentAdmin: sendorID,
            toVendor: recieverID,
            title: title,
            message: message
        })
    }
    else if(sendor === 'admin' && reciever === 'customer'){
        await InAAPNotifications.create({
            sentVendor: sendorID,
            toCustomer: recieverID,
            title: title,
            message: message
        })
    }
    else if(sendor === 'vendor' && reciever === 'admin'){
        await InAAPNotifications.create({
            sentVendor: sendorID,
            toAdmin: recieverID,
            title: title,
            message: message
        })
    }
    else if(sendor === 'vendor' && reciever === 'customer'){
        await InAAPNotifications.create({
            sentVendor: sendorID,
            toCustomer: recieverID,
            title: title,
            message: message
        })
    }
    else if(sendor === 'customer' && reciever === 'vendor'){
        await InAAPNotifications.create({
            sentCustomer: sendorID,
            toVendor: recieverID,
            title: title,
            message: message
        })
    }
    else if(sendor === 'customer' && reciever === 'admin'){
        await InAAPNotifications.create({
            sentCustomer: sendorID,
            toAdmin: recieverID,
            title: title,
            message: message
        })
    }
    else if(!sendor && reciever === 'admin'){
        await InAAPNotifications.create({
            toAdmin: recieverID,
            title: title,
            message: message
        })
    }
    else if(!sendor && reciever === 'vendor'){
        await InAAPNotifications.create({
            toVendor: recieverID,
            title: title,
            message: message
        })
    }
    else if(!sendor && reciever === 'customer'){
        await InAAPNotifications.create({
            toCustomer: recieverID,
            title: title,
            message: message
        })
    }


    return true;
}
