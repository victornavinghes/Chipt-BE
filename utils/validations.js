const validation = {

    // 1) EMAIL VALIDATION
    emailValidation: function (email) {
        // a) Variable declaration
        let returnObject = {
            success: false,
            message: ''
        };

        // b) Fetching test value for check
        const emailCheck1 = email.lastIndexOf('@') // Fetching '@' in email address
        const emailCheck2 = email.lastIndexOf('.') // Foteching '.' in email address

        // c) Checking conditions for email address
        if (emailCheck1 === -1) {
            returnObject.success = false
            returnObject.message = "Email address doesn't have '@'"
        } else if (emailCheck2 === -1) {
            returnObject.success = false
            returnObject.message = "Email address doesn't have '.'"
        } else if (emailCheck1 > emailCheck2) {
            returnObject.success = false
            returnObject.message = "Please use '.' after @"
        } else {
            returnObject.success = true
            returnObject.message = "Allowed"
        }

        // d) Returning result
        return returnObject
    },

    // 2) USERNAME VALIDATION
    usernameValidation: function (username) {

        // a) Variable declaration
        let returnObject = {
            success: true,
            message: ''
        };
        const notAllowed = [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47, 58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 96, 123, 124, 125, 126, 127]
        for (let i = 0; i < username.length; i++) {
            let x = username.charCodeAt(i)
            if (notAllowed.includes(x)) {
                returnObject.success = false
                returnObject.message = `'${username[i]}' not allowed in user name`
                break
            }
        }
        return returnObject;
    },

    // 3) PASSWORD VALIDATION
    passwordValidation: function (password) {

        // a) Variable declaration
        let returnObject = {
            success: false,
            message: ''
        };

        let numCheck = false
        let smallChar = false
        let capitalChar = false

        const allowedNum = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57]
        const allowedSmallChar = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90]
        const allowedCapitalNum = [97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122]


        if (password.length < 8) {
            returnObject.success = false;
            returnObject.message = 'Password length should have to minumum 8 character'
            return returnObject
        }
        for (let i = 0; i < password.length; i++) {
            let x = password.charCodeAt(i)
            if (allowedNum.includes(x)) numCheck = true
            if (allowedSmallChar.includes(x)) smallChar = true
            if (allowedCapitalNum.includes(x)) capitalChar = true
        }

        if (numCheck && smallChar && capitalChar) {
            if (password.length < 8) {
                returnObject.success = true
                returnObject.message = `Password should contain minimum 8 characters!`
            } else if (password.length > 7 && password.length < 12) {
                returnObject.success = true
                returnObject.message = `Weak Password!`
            } else if (password.length > 11 && password.length < 17) {
                returnObject.success = true
                returnObject.message = `Average Password!`
            } else {
                returnObject.success = true
                returnObject.message = `Strong Password!`
            }

        } else {
            returnObject.success = false
            returnObject.message = `Password should include alleast one number, one small case character, and one capital case character!`
        }
        return returnObject;
    },

    // 4) SAME PASSWORD VALIDATION
    samePasswordValidation: function (newPassword, confirmPassword) {
        
        // a) Variable declaration
        let returnObject = {
            success: false,
            message: ''
        };
        if(newPassword !==confirmPassword){
            returnObject.success = false,
            returnObject.message = `New and Confirm passwords do not match!`
        }
        else if(newPassword === confirmPassword){
            returnObject.success = true;
            returnObject.message = `New and Confirm passwords are same!`
        }
        return returnObject;
    }
}

module.exports = validation;