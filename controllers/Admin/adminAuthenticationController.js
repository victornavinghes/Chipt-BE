// Built in modules import
const OTPgenerator = require('otp-generator');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary');
const crypto = require('crypto');

// Database import
const Admin = require('../../models/Admin/Admin.js');

// Created module import
const CatchAsync = require('../../errors/catchAsync.js')
const ErrorHandler = require('../../utils/errorHandler.js');
const authToken = require('../../utils/authToken.js');
const sendEmail = require('../../utils/sendMails.js');
const utilsMiddleware = require('../utilController/utilsMiddleware.js')
const projectValidation = require('../../utils/validations.js');
const { userAuthenticationResponses, adminResponses } = require('../../utils/responseObjects.js');

/* 
    Index:
        01) Sign up
        02) OTP verification
        03) Resend OTP
        04) Sign in
        05) Sign out
        06) Password update
        07) (Email) Forgot password
        08) (Email) Reset password
        09) Profile information
        10) Profile information update
        11) Profile image upload
        12) Profile image delete
*/

// 01) ✅ ADMIN: Sign up
exports.projectName_Admin_Account_Sign_Up = CatchAsync(async (req, res, next) => {

    // a) Destructuring request body and checking for all data
    const { username, email, password } = req.body
    if (!username || !email || !password) {
        return next(new ErrorHandler('Please fill all the required fields', 400))
    }

    // b) Validating username, email, and password
    const emailValidation = projectValidation.emailValidation(req.body.email);
    if (!emailValidation.success) {
        return next(new ErrorHandler(`${emailValidation.message}`, 400));
    }

    const usernameValidation = projectValidation.usernameValidation(req.body.username);
    if (!usernameValidation.success) {
        return next(new ErrorHandler(`${usernameValidation.message}`, 400));
    }

    const passwordValidation = projectValidation.passwordValidation(req.body.password);
    if (!passwordValidation.success) {
        return next(new ErrorHandler(`${passwordValidation.message}`, 400));
    }

    // c) Checking if email or username already exist
    const unBool = await utilsMiddleware.userUsernameExistanceCheck(req.body.username);
    const elBool = await utilsMiddleware.userEmailExistanceCheck(req.body.email.toLowerCase());

    if (unBool) {
        return next(new ErrorHandler(`User already exist with same username`, 400))
    }
    if (elBool) {
        return next(new ErrorHandler(`User already exist with same email address`, 400))
    }

    // d) Generating OTP for customer account
    const OTP = OTPgenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        digits: true,
        specialChars: false
    })

    // e) Creating admin account
    const admin = await Admin.create({
        username: req.body.username.toLowerCase(),
        primaryEmail: req.body.email.toLowerCase(),
        password: req.body.password,
        userOTP: {
            otp: OTP,
            timeToExpire: Date.now() + 960000,
            OTPVerifed: false
        }
    })
    if (!admin) {
        return next(new ErrorHandler("Something went wrong", 500));
    }

    // f) Sending OTP to vendor
    let emailSuccess = false
    let message = `Dear Admin,\n\nVerification OTP for your account registration is ${OTP}.\n\nThanks,\nChipt`
    try {
        const t1 = await sendEmail({
            email: req.body.email,
            subject: 'Chipt Application Admin Sign Up.',
            message,
        })
        emailSuccess = true
    } catch (err) {
        emailSuccess = false
    }

    // g) If OTP not sent then sending error response
    if (!emailSuccess) {
        await Admin.findByIdAndDelete({ _id: admin._id })
            .catch((err) => {
                return next(new ErrorHandler(`Something went wrong`, 200))
            })
        return next(new ErrorHandler(`Something went wrong while sending OTP`, 404))
    }

    // h) Sending response
    authToken.userSendToken(res, 200, admin, 'signup', 'admin')
})

// 02) ✅ ADMIN: OTP VERIFICATION 
exports.projectName_Admin_Account_OTP_Verification = CatchAsync(async (req, res, next) => {

    // a) Destructuring logged in vendor ID and destructuring request body
    const adminID = req.user.id
    const { otp } = req.body

    // b) Sending error response if OTP not provided
    if (!otp) {
        return next(new ErrorHandler("Please enter your otp", 400));
    }

    // c) Fetching vendor and checking if vendor exists
    const admin = await Admin.findById({ _id: adminID })
        .catch((err) => {
            return next(new ErrorHandler(`Something went wrong`, 200))
        })
    if (!admin) {
        return next(new ErrorHandler('No such Vendor found!', 404))
    }

    // d) Checking if otp is expired or not
    if (admin.userOTP.OTPVerifed) {
        res.status(200).json({
            success: true,
            message: 'OTP is already Verified'
        })
    }
    else if (admin.userOTP.timeToExpire <= Date.now()) {
        admin.userOTP.otp = undefined
        admin.userOTP.timeToExpire = undefined
        admin.userOTP.OTPVerifed = false
        return next(new ErrorHandler('Your OTP has been Expired!', 409))
    }
    else if (admin.userOTP.timeToExpire > Date.now()) {
        if (admin.userOTP.otp === req.body.otp) {
            admin.accountActive = true
            admin.accountVerified = true
            admin.userOTP.otp = undefined
            admin.userOTP.timeToExpire = undefined
            admin.userOTP.OTPVerifed = true
            await admin.save()
        }
        res.status(200).json({
            success: true,
            message: 'OTP Verified'
        })
    }
})

// 03) ✅ ADMIN: RESEND OTP 
exports.projectName_Admin_Account_Resend_OTP = CatchAsync(async (req, res, next) => {

    // a) Destructuring logged in vendor ID and destructuring request body
    const adminID = req.user.id

    // b) Fetching vendor and checking if vendor exists
    const admin = await Admin.findById({ _id: adminID })
        .select("+accountActive +accountVerified")
        .catch((err) => {
            return next(new ErrorHandler(`Something went wrong`, 200))
        });
    if (!admin) {
        return next(new ErrorHandler('No such Vendor found!', 404))
    }

    // c) Generating OTP for customer account
    const OTP = OTPgenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        digits: true,
        specialChars: false
    })

    // d) Sending OTP to vendor
    let emailSuccess = false
    let message = `Dear Admin,\n\nVerification OTP for your account is ${OTP}.\n\nThanks,\nChipt`
    try {
        await sendEmail({
            email: admin.primaryEmail,
            subject: 'Chipt account OTP',
            message,
        })
        emailSuccess = true
        admin.userOTP.otp = OTP
        admin.userOTP.timeToExpire = Date.now() + + 960000;
        admin.userOTP.OTPVerifed = false
        await admin.save()
    } catch (err) {
        emailSuccess = false
        return next(new ErrorHandler(err.message, 500))
    }

    // e) If OTP not sent then sending error response
    if (!emailSuccess) {
        admin.userOTP.otp = undefined;
        admin.userOTP.timeToExpire = undefined;
        admin.userOTP.OTPVerifed = undefined;
        await admin.save()
        return next(new ErrorHandler(`Something went wrong while sending OTP`, 404))
    }

    // f) If OTP sent then saving sent OTP in vendor databse


    // g) Sending response
    res.status(200).json({
        success: true,
        message: 'OTP Sent Successfully!'
    })
})

// 04) ✅ ADMIN: Sign in
exports.projectName_Admin_Account_Sign_In = CatchAsync(async (req, res, next) => {

    // a) Destructuring the data from request body
    const { email, password } = req.body;

    // b) Checking if email and password
    if (!email || !password) {
        return next(new ErrorHandler(`Please enter email and password`, 400))
    }

    // b) Checking if user exist
    const adminExist = await Admin.findOne({ primaryEmail: email.toLowerCase() })
        .select("+password");

    // c) Checking password are same or not
    if (!adminExist || !await adminExist.correctPassword(password, adminExist.password)) {
        return next(new ErrorHandler('Invalid Credential', 401))
    }

    // d) Fetching User data
    const admin = await Admin.findById({ _id: adminExist._id })
        .select("+alleyAuth name userName email OTPVerified")
        .catch((err) => {
            return next(new ErrorHandler(`Something went wrong`, 200))
        });

    // e) Setting cookie and sending response
    authToken.userSendToken(res, 200, admin, 'login', 'admin')
})

// 05) ✅ ADMIN: Sign out
exports.projectName_Admin_Account_Sign_Out = CatchAsync(async (req, res, next) => {
    // a) Setting null value for header authorization and cookie
    req.headers.authorization = null
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    // b) Sending response
    res.status(200).json({
        success: true,
        message: 'You are logged out.'
    })
})

// 06) ✅ ADMIN: Password update
exports.projectName_Admin_Account_Password_Change = CatchAsync(async (req, res, next) => {

    // a) Extraacting vendor id from logged in vendor
    const adminID = req.user.id

    // b) Fetching vendor details
    const admin = await Admin.findById({ _id: adminID })
        .select('+password')
        .catch((err) => {
            return next(new ErrorHandler(`Something went wrong`, 200))
        });

    // c) Checking saved and provided password are save or not 
    const ispasswordMatch = await admin.correctPassword(req.body.oldpassword, admin.password);
    if (!ispasswordMatch) {
        return next(new ErrorHandler('Old password is incorrect', 400))
    }

    // d) Validating password
    const passwordValidation = projectValidation.passwordValidation(req.body.newpassword);
    if (!passwordValidation.success) {
        return next(new ErrorHandler(`${passwordValidation.message}`, 400));
    }

    // e) Checking if new password and confirm password are same
    if (req.body.newpassword !== req.body.confirmpassword) {
        return next(new ErrorHandler("Passwords doesn't match.", 404));
    }

    // f) Saving password
    admin.password = req.body.newpassword;
    await admin.save();

    // Sending cookie and response
    authToken.userSendToken(res, 200, admin, 'passwordupdate', 'admin')
})

// 07) ✅ ADMIN: (Email) Forgot password
exports.projectName_Admin_Account_Forgot_Password = CatchAsync(async (req, res, next) => {

    // a) Destructuring request body and checking if data are provided
    const { email } = req.body;
    if (!email) {
        return next(new ErrorHandler("Please enter your registered Email address!", 400))
    }

    // b) Fetching user and checking if vendor exist
    const admin = await Admin.findOne({ primaryEmail: req.body.email.toLowerCase() });

    if (!admin) {
        return next(new ErrorHandler(`No allowed!`, 200));
    }

    // c) OTP generation
    const otp = OTPgenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });

    // e) Saving OTP in vendor record and sending success response
    let tempData = new Date(Date.now() + 9600000)
    admin.forgotOTP.otp = otp;
    admin.forgotOTP.OTPVerifed = false;
    admin.forgotOTP.timeToExpire = Date.now();
    admin.resetPasswordToken = undefined
    admin.resetPasswordTokenExpire = undefined
    await admin.save()

    // d) Sending email to vendor and if it fail sending error response
    let emailSend = false
    const message = `Dear admin,\n\nGreeting of the day.\n\nYour account reset verification OTP is ${otp}, Please use this otp before ${tempData.toString()} otherwise it will expire. \n\n If you have not request this email then please ignore this!\n\nThanks\nChipt`;
    await sendEmail({
        email: req.body.email,
        subject: 'Chipt Account Password Reset',
        message,
    }).then(() => emailSend = true)
        .catch(() => emailSend = false)

    if (!emailSend) {
        admin.forgotOTP.otp = undefined;
        admin.forgotOTP.OTPVerifed = false;
        admin.timeToExpire = undefined;
        admin.resetPasswordToken = undefined
        admin.resetPasswordTokenExpire = undefined
        await admin.save()
        return next(new ErrorHandler('Something went wrong while sending the mail!', 500))
    }

    res.status(200).json({
        success: true,
        message: `OTP sent to ${email}`
    })
})

exports.projectName_Admin_Account_Reset_OTP_Verification = CatchAsync(async (req, res, next) => {

    // a) Destructuting request body and checking it they are provided
    const { email, otp } = req.body
    if (!email || !otp) {
        return next(new ErrorHandler(`Please provide Email and OTP for verification!`, 400))
    }

    // b) Fetching Vendor and checking if they exist
    const admin = await Admin.findOne({ primaryEmail: req.body.email.toLowerCase() })
    if (!admin) {
        return res.status(200).json({
            success: false,
            message: `No such admin exist by this email`
        })
    }

    // c) Verifying if saved and proided OTP are same
    if (admin.forgotOTP.otp !== parseInt(req.body.otp)) {
        return res.status(200).json({
            success: false,
            message: `OTP does not match`
        })
    }

    let tempTime = admin.forgotOTP.timeToExpire.getTime() + 9600000;
    if (tempTime <= Date.now()) {
        admin.forgotOTP.otp = undefined;
        admin.forgotOTP.timeToExpire = undefined;
        admin.forgotOTP.OTPVerifed = false;
        return next(new ErrorHandler(`OTP has been expired`, 403));
    }

    admin.forgotOTP.otp = undefined;
    admin.forgotOTP.timeToExpire = undefined;
    admin.forgotOTP.OTPVerifed = true;
    await admin.save();

    res.status(200).json({
        success: true,
        message: `OTP verified successfully`
    })
})

// 08) ✅ ADMIN: (Email) Reset password
exports.projectName_Admin_Account_Reset_Password = CatchAsync(async (req, res, next) => {
    
    // a) Destructuring request body and checking for all fields required
    const { email, newPassword, confirmPassword } = req.body
    if (!email || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Please provide all details"
        })
    }
    const passwordValidation = projectValidation.passwordValidation(req.body.newPassword);
    if (!passwordValidation.success) {
        return res.status(400).json({
            success: false,
            message: `${passwordValidation.message}`
        })
    }

    // b) Fetching vendor using reset token
    const admin = await Admin.findOne({primaryEmail: req.body.email.toLowerCase()})

    // c) Checking if vendor exist and if new and confirm passwords are same
    if (!admin) {
        return res.status(404).json({
            success: false,
            message: `Admin doesn't exist`
        })
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Passwords doesn't match.", 404));
    }


    // d) Saving password and other details
    // d) Saving password and other details
    admin.password = req.body.newPassword
    admin.forgotOTP.otp = undefined;
    admin.forgotOTP.timeToExpire = undefined;
    admin.forgotOTP.OTPVerifed = undefined;
    admin.resetPasswordToken = undefined,
    admin.resetPasswordExpire = undefined
    await admin.save()

    // e) Sending response
    userAuthenticationResponses.userPasswordResetResponse(res, 200, 'admin')
})

// 09) ✅ ADMIN: Profile information 
exports.projectName_Admin_Profile_Information = CatchAsync(async (req, res, next) => {

    // a) Fetching admin id from login information
    const adminID = req.user.id

    // b) Fetching admin profile
    const adminProfile = await Admin.findById({ _id: adminID })
        .select("username primaryEmail +secondaryEmail countryCode primaryContactNumber +secondaryContactNumber +name profilePicture")
        .catch((err) => {
            return next(new ErrorHandler(`Something went wrong`, 200))
        })
    // c) Checking if profile exist or not
    if (!adminProfile) {
        return next(new ErrorHandler(`No data found`, 404))
    }

    // d) Sending response
    adminResponses.adminProfileInformationResponse(res, 200, adminProfile, true)
})

// 10) ✅ ADMIN: Profile information update
exports.projectName_Admin_Profile_Information_Update = CatchAsync(async (req, res, next) => {

    // a) Fetching admin id from login information
    const adminID = req.user.id

    // b) Fetching admin profile
    const adminProfile = await Admin.findById({ _id: adminID })
        .select("username primaryEmail +secondaryEmail countryCode primaryContactNumber +secondaryContactNumber +name")
        .catch((err) => {
            return next(new ErrorHandler(`Something went wrong`, 200))
        });
    if (!adminProfile) {
        return next(new ErrorHandler(`Something went wrong, Please try again`, 400))
    }

    // c) Validation of email and password, Checking if provided email and password exist
    if (req.body.username && adminProfile.username !== req.body.username) {
        const usernameCheck = projectValidation.usernameValidation(req.body.username)
        if (!usernameCheck) return next(new ErrorHandler(`User name is not valid`, 400))
        if (adminProfile.username !== req.body.username) {
            const usernameUniqueCheck = utilsMiddleware.userUsernameExistanceCheck(req.body.username)
            if (!usernameUniqueCheck) return next(new ErrorHandler(`User name already in used`, 400))
        }
    }

    if (req.body.primaryEmail && adminProfile.primaryEmail.toLowerCase() !== req.body.primaryEmail.toLowerCase()) {
        const emCheck = await utilsMiddleware.userEmailExistanceCheck(req.body.primaryEmail.toLowerCase());
        if (emCheck) {
            return next(new ErrorHandler(`User with this ${req.body.primaryEmail} address has been registered before`, 409))
        }
    }

    if (req.body.primaryNumber &&  adminProfile.primaryContactNumber !== req.body.primaryNumber) { 
        const cnCheck = await utilsMiddleware.userContactExistanceNoCodeCheck(req.body.primaryNumber)
        if (cnCheck) {
            return next(new ErrorHandler(`Contact number ${req.body.primaryNumber} already in use by other user, Try new one.`, 409))
        }
    }

    // d) Updating admin profile
    adminProfile.username = req.body.username ? req.body.username.toLowerCase() : adminProfile.username.toLowerCase();
    adminProfile.primaryEmail = req.body.primaryEmail ? req.body.primaryEmail.toLowerCase() : adminProfile.primaryEmail.toLowerCase();
    adminProfile.countryCode = req.body.countryCode ? req.body.countryCode : adminProfile.countryCode;
    adminProfile.primaryContactNumber = req.body.primaryNumber ? req.body.primaryNumber : adminProfile.primaryContactNumber;
    adminProfile.name = req.body.name ? req.body.name.toLowerCase() : adminProfile.name.toLowerCase();

    // d.1) Updating if prfovided
    const admin = await adminProfile.save();

    // e) Sending response
    adminResponses.adminProfileInformationResponse(res, 200, admin, false)
})

// 11) ✅ ADMIN: Profile image upload
exports.projectName_Admin_Account_Profile_Image_Upload = CatchAsync(async (req, res, next) => {

    // a) Variable declaration and fetching customerID 
    let resizedImage;
    let adminID = req.user.id;

    // b) checking if the image is present or not
    if (!req.files.file) return next(new ErrorHandler('No image is provided.', 404))
    if (req.files.file.length > 1) return next(new ErrorHandler(`Please upload only single file`, 400));

    // c) Fetching admin details
    const admin = await Admin.findById({ _id: adminID })
        .select("profilePicture")
        .catch((err) => {
            return next(new ErrorHandler(`Something went wrong`, 200))
        });

    // d) Compressing image 
    await utilsMiddleware.utilsUploadProfileImage(req.files.file)
        .then((data) => {
            resizedImage = data
        })

    // e) Uploading image in database
    if (admin.profilePicture.public_id.toString() !== "default/user_jvowub") {
        await cloudinary.uploader.destroy(admin.profilePicture.public_id)
    }

    const myCloud = await cloudinary.v2.uploader.upload_stream({ folder: `admin/${admin._id}/profilePicture` },
        async function (err, image) {
            req.body.profilePicture = {
                public_id: image.public_id,
                url: image.url,
            }

            // f) Saving admin profile picture
            admin.profilePicture = req.body.profilePicture
            await admin.save()

            res.status(200).json({
                success: true,
                message: 'Yeah!',
                admin
            })
        }
    );

    // g) Saving data using stream
    await streamifier.createReadStream(resizedImage.data).pipe(myCloud)
})

// 12) ✅ ADMIN: Profile image delete
exports.projectName_Admin_Account_Profile_Image_Delete = CatchAsync(async (req, res, next) => {

    // a) Fetching vendor ID
    let adminID = req.user.id;

    // b) Fetching vendor details
    const admin = await Admin.findById({ _id: adminID })
        .select("profilePicture")
        .catch((err) => {
            return next(new ErrorHandler(`Something went wrong`, 200))
        });

    if (!admin.profilePicture) {
        return next(new ErrorHandler('No image found', 200))
    }

    // c) Checking for default image data
    if (admin.profilePicture.public_id.toString() === "user_jvowub") {
        return res.status(200).json({
            success: true,
            message: 'No Image uploaded'
        })
    }

    // d) Destroying cloudinary image and setting default image in profile
    const publicID = admin.profilePicture.public_id;
    await cloudinary.uploader.destroy(publicID)
    admin.profilePicture = {
        public_id: "default/user_jvowub",
        url: "https://res.cloudinary.com/dl0p1krhq/image/upload/v1706509827/default/user_jvowub.png"
    }
    await admin.save();

    // e) Sending response
    res.status(200).json({
        success: true,
        message: 'Profile image deleted successfully',
    })
})