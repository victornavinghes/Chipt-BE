// BuiltIn Module Import

// Database Import 
const Admin = require('../../models/Admin/Admin.js');


// User Created Module Import
const CatchAsync = require('../../midddlewares/catchAsync.js');
const ErrorHandler = require('../../utils/errorHandler.js');
const validation = require('../../utils/validations.js');

/*
    Middlerwares and Modules
    01) Username check
    02) Email check
*/ 


// 01) ACCOUNT: EMAIL ADDRESS CHECK
exports.projectName_Email_Check_For_Account_Creation = CatchAsync(async (req, res, next) => {

    // a) Destructuring req.body 
    const { email } = req.body;

    // b) Checking if email address is provided
    if (!email) {
        return next(new ErrorHandler("Please provide email address", 400));
    }

    // c) Validating email address
    const emailCheck = validation.emailValidation(email)
    if(!emailCheck.success){
        return next(new ErrorHandler(emailCheck.message, 400))
    }

    // d) Checking if user exist with same email address
    const userExistanceEmailCheck = await User.findOne({ email: req.body.email });
    const adminExistanceEMailCheck = await Admin.findOne({ email: req.body.email });

    if (userExistanceEmailCheck || adminExistanceEMailCheck) {
        return next(new ErrorHandler(`User Already exist with same email address. Please, try with new one.`, 400))
    }

    // e) Sending response for allowed email
    res.status(200).json({
        success: true,
        message: 'Allowed'
    })

})

// 02) ACCOUNT: USERNAME CHECK
exports.projectName_User_Name_Check_For_Account_Creation = CatchAsync(async (req, res, next) => {

    // a) Destructuring req.body 
    const { username } = req.body;

    // b) Checking if all field are provided
    if (!username || !email || !password) {
        return next(new ErrorHandler("Please provide all details", 400))
    }

    // c) Checking if not allowed symbols is provided
    const userNameCheck = validation.usernameValidation(username)
    if(!userNameCheck.success){
        return next(new ErrorHandler(userNameCheck.message, 400))
    }

    // d) Checking if user exist with same Username
    const userExistanceUNCheck = await User.findOne({ userName: req.body.userName });
    const adminExistanceUNCheck = await Admin.findOne({ userName: req.body.userName });

    if (userExistanceUNCheck || adminExistanceUNCheck) {
        return next(new ErrorHandler(`User Already exist with same user name. Please, try with new one.`, 400))
    }

    // e) Sending response for allowed username
    res.status(200).json({
        success: true,
        message: 'Allowed'
    })
})