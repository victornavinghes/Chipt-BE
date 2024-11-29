exports.userAuthenticationResponses = {
  // a) User -> Admin, Vendor Registration
  userRegistrationResponse: function (
    res,
    statusCode,
    userCategory,
    token,
    user
  ) {
    return res.status(statusCode).json({
      success: true,
      message: `Dear ${
        userCategory === "admin"
          ? "Admin"
          : userCategory === "vendor"
          ? "Vendor"
          : "User"
      } verification OTP sent to your email address!`,
      token: token,
    });
  },

  // b) User -> Admin, Vendor, and Customer Sign Up
  userSignUpResponse: function (
    res,
    statusCode,
    userCategory,
    token,
    user,
    firstTime
  ) {
    return res.status(statusCode).json({
      success: true,
      message: `Account created successfully!`,
      token: token,
      isActive: false,
      firstTime,
      customer: user,
    });
  },

  // c) User -> Admin, Vendor, and Customer Sign In
  userLoginInResponse: function (
    res,
    statusCode,
    userCategory,
    token,
    user,
    firstTime
  ) {
    return res.status(statusCode).json({
      success: true,
      message: `Login successful!`,
      token: token,
      isActive: user.accountActive,
      isVerified: user.accountVerified,
      firstTime: firstTime,
      customer: user,
    });
  },

  // d) User -> Admin, Vendor, and Customer Password update
  userPasswordChangeResponse: function (
    res,
    statusCode,
    userCategory,
    token,
    user
  ) {
    return res.status(statusCode).json({
      success: true,
      message: `Password updated successfully!`,
      token: token,
    });
  },

  // e) User -> Admin, Vendor, and Customer password reset
  userPasswordResetResponse: function (res, statusCode, userCategory) {
    return res.status(statusCode).json({
      success: true,
      message: `Password recovery successful!`,
    });
  },

  // f) User -> Admin, Vendor, and Customer Profile information response
  userProfileInformationResponse: function (
    res,
    statusCode,
    userCategory,
    user
  ) {
    let data;
    if (userCategory === "admin") {
      data = {
        _id: user._id,
        accountActive: user.accountActive,
        username: user.primaryEmail,
        name: user.name ? user.name : "-",
      };
    } else if (userCategory === "vendor") {
      data = {
        _id: user._id,
        accountActive: user.accountActive,
        username: user.username,
        name: user.name ? user.name : "-",
        email: user.primaryEmail,
        profilePicture: user.profilePicture,
        plotnumber: user.plotnumber,
        countryCode: user.countryCode,
        contactNumber: user.primaryContactNumber,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        zipCode: user.zipCode,
      };
      if (user.secondaryEmail) data.secondaryEmail = user.secondaryEmail;
      if (user.secondaryContactNumber)
        data.secondaryContactNumber = user.secondaryContactNumber;
      if (user.location) data.location = user.location;
    } else if (userCategory === "customer") {
      data = {
        _id: user._id,
        accountActive: user.accountActive,
        username: user.primaryEmail,
        firstname: user.firstname ? user.firstname : "",
        middlename: user.middlename ? user.middlename : "",
        lastname: user.lastname ? user.lastname : "",
        profilePicture: user.profilePicture ? user.profilePicture : null,
      };
      if (user.accountActive) {
        data.firstname = user.firstname;
        data.lastname = user.lastnamename;
      }
    }
    return res.status(statusCode).json({
      success: true,
      message: `${
        userCategory === "admin"
          ? "Admin"
          : userCategory === "vendor"
          ? "Vendor"
          : "User"
      } profile information!`,
      user: data,
    });
  },

  userProfileImageUploadResponse: function (res, statusCode) {
    res.status(statusCode).json({
      success: true,
      message: "Profile Images uploaded successfully",
    });
  },

  userGelleryImagesUploadResponse: function (res, statusCode) {
    res.status(statusCode).json({
      success: true,
      message: "Gallery Images uploaded successfully",
    });
  },
};

exports.adminResponses = {
  // 1) Admin profile information
  adminProfileInformationResponse: function (res, statusCode, user, msgCheck) {
    let resData = {
      success: true,
      message: msgCheck
        ? `Admin profile information!`
        : `Admin profile updated successfully!`,
    };

    let admin = {
      _id: user._id,
      username: user.username,
      name: user.name ? user.name : null,
      email: user.primaryEmail,
      countryCode: user.countryCode,
      contactNumber: user.primaryContactNumber,
      profilePicture: user.profilePicture ? user.profilePicture : null,
    };

    resData.admin = admin;

    res.status(statusCode).json(resData);
  },

  // a) Vendor data response
  registeredVendorAccountResponse: function (res, statusCode, user, isList) {
    let data;
    if (isList) {
      data = user.map((data) => {
        const temp = {
          _id: data._id,
          accountActive: data.accountActive,
          accountVerified: data.accountVerified,
          registrationID: data.registrationID,
          username: data.username,
          name: data.name,
          primaryEmail: data.primaryEmail,
          countryCode: data.countryCode,
          primaryContactNumber: data.primaryContactNumber,
          plotnumber: data.plotnumber,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          zipCode: data.zipCode,
        };
        if (data.username) {
          temp.username = user.username;
        }
        if (data.profilePicture) {
          temp.profilePicture = data.profilePicture;
        }
        if (data.location) {
          temp.location = data.location;
        }
        return temp;
      });
    } else if (!isList) {
      data = {
        _id: user._id,
        registrationID: user.registrationID,
        accountActive: user.accountActive,
        accountVerified: user.accountVerified,
        username: user.username,
        name: user.name,
        primaryEmail: user.primaryEmail,
        countryCode: user.countryCode,
        primaryContactNumber: user.primaryContactNumber,
        plotnumber: user.plotnumber,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        zipCode: user.zipCode,
      };

      if (user.username) {
        data.username = user.username;
      }
      if (user.profilePicture) {
        data.profilePicture = user.profilePicture;
      }
      if (user.location) {
        data.location = user.location;
      }
    }

    return res.status(statusCode).json({
      success: true,
      message: `${isList ? "All vendors" : "Vendor profile"}`,
      vendors: data,
    });
  },
};

exports.vendorResponses = {
  // a) Vendor stock response
  vendorStoreStockInformationResponse: function (
    res,
    statusCode,
    user,
    isList
  ) {
    let data;
    return res.status(statusCode).json({
      success: true,
      message: `${
        isList ? "Vendors stock inforamtion" : "Vendor stock inforamtion"
      }`,
      vendors: data,
    });
  },

  // b) Vendor stock response
  vendorStoreRequestInformationResponse: function (
    res,
    statusCode,
    user,
    isAll,
    isList
  ) {
    let data;
    return res.status(statusCode).json({
      success: true,
      message: `${
        isList
          ? isAll
            ? "Vendors stock requests"
            : "Vendor stock requests"
          : "Vendor stock request"
      }`,
      vendors: data,
    });
  },
};

exports.customerResponses = {
  customerProfileInformation: function (res, statusCode, user) {
    let customer;
    let resData = {
      success: true,
      message: "Profile Information",
    };
    customer = {
      _id: user._id,
      isActive: user.accountActive,
      isVerified: user.accountVerified,
      name: user.name ? user.name : null,
      profilePicture: user.profilePicture ? user.profilePicture : null,
      primaryEmail: user.primaryEmail ? user.primaryEmail : null,
      countryCode: user.countryCode ? user.countryCode : null,
      contact: user.primaryContactNumber ? user.primaryContactNumber : null,
    };
    resData.customer = customer;
    res.status(statusCode).json(resData);
  },

  customersListInformation: function (res, statusCode, users, isList) {
    let customers;
    let resData = {
      success: true,
      message: "",
    };

    if (isList) {
      resData.message = "All cusomters";
      customers = users.map((data) => {
        let temp = {
          _id: data._id,
          isActive: data.accountActive,
          isVerified: data.accountVerified,
          firstname: data.firstname ? data.firstname : null,
          middlename: data.middlename ? data.middlename : null,
          lastname: data.lastname ? data.lastname : null,
          profilePicture: data.profilePicture ? data.profilePicture : null,
          primaryEmail: data.primaryEmail ? data.primaryEmail : null,
          countryCode: data.countryCode ? data.countryCode : null,
          primaryContactNumber: data.primaryContactNumber
            ? data.primaryContactNumber
            : null,
          plotnumber: data.plotnumber ? data.plotnumber : null,
          address: data.address ? data.address : null,
          city: data.city ? data.city : null,
          state: data.state ? data.state : null,
          country: data.country ? data.country : null,
          zipCode: data.zipCode ? data.zipCode : null,
          location: data.location ? data.location.coordinates : null,
        };
        return temp;
      });
      resData.length = customers.length;
      resData.customers = customers;
    } else if (!isList) {
      resData.message = "Customer information";
      customers = {
        _id: users._id,
        isActive: users.accountActive,
        isVerified: users.accountVerified,
        username: users.username ? users.username : null,
        firstname: users.firstname ? users.firstname : null,
        middlename: users.middlename ? users.middlename : null,
        lastname: users.lastname ? users.lastname : null,
        gender: users.gender ? users.gender : null,
        dateOfBirth: users.dateOfBirth
          ? users.dateOfBirth.toString().split(" ").slice(0, 4)
          : null,
        profilePicture: users.profilePicture ? users.profilePicture : null,
        email: users.primaryEmail ? users.primaryEmail : null,
        countryCode: users.countryCode ? users.countryCode : null,
        contact: users.primaryContactNumber ? users.primaryContactNumber : null,
        plotnumber: users.plotnumber ? users.plotnumber : null,
        address: users.address ? users.address : null,
        city: users.city ? users.city : null,
        state: users.state ? users.state : null,
        country: users.country ? users.country : null,
        zipCode: users.zipCode ? users.zipCode : null,
        location: users.location ? users.location.coordinates : null,
      };
      resData.customers = customers;
    }
    res.status(statusCode).json(resData);
  },
};

exports.cupsResponses = {
  // a) Inventory Cup Response
  checkCupTypeExist: function (finalData, valueType) {
    let isCupExist = false;
    let indexVal = -1;
    for (let i = 0; i < finalData.length; i++) {
      if (finalData[i].cupType === valueType) {
        isCupExist = true;
        indexVal = i;
        break;
      }
    }
    let returnVal = {
      isCupExist: isCupExist,
      indexVal: indexVal,
    };
    return returnVal;
  },
  cupsInInventoryResponse: function (
    res,
    statusCode,
    cups,
    isList,
    isAvailable
  ) {
    let cupTempData;
    let resData = {
      success: true,
      message: "",
    };
    if (isList) {
      cupTempData = cups.map((data) => {
        let temp = {
          cupType: data.cupType,
          availableSize: [
            {
              _id: data._id,
              cupModelUniqueId: data.cupModelUniqueId,
              isCupAvailable: data.isCupAvailable,
              cupSize: data.cupSize,
              cupCapacity: data.cupCapacity + " ml",
              numberOfCups: data.numberOfCups,
              cupPrice: data.cupPrice,
              currency: data.currency,
              points: data.loyaltyPoints + "/per cup",
              returnTime: data.returnTime,
            },
          ],
        };
        if (data.cupsAvailable) {
          temp.availableSize[0].cupsAvailable = data.cupsAvailable;
        }
        // console.log(temp)
        return temp;
      });
      let finalData = [];

      for (let i = 0; i < cupTempData.length; i++) {
        if (i == 0) {
          finalData[0] = cupTempData[i];
        } else {
          const checkCupTypeExist = this.checkCupTypeExist(
            finalData,
            cupTempData[i].cupType
          );
          if (checkCupTypeExist.isCupExist) {
            finalData[checkCupTypeExist.indexVal].availableSize.push(
              cupTempData[i].availableSize[0]
            );
          } else {
            finalData.push(cupTempData[i]);
          }
        }
      }

      resData.message =
        isAvailable === 2
          ? "All cups in inventory "
          : isAvailable
          ? `Available cups in inventory`
          : `Unavailable cups in inventory`;
      resData.length = finalData.length;
      resData.cups = finalData;
    } else if (!isList) {
      data = {
        _id: cups._id,
        isCupAvailable: cups.isCupAvailable,
        cupUniqueId: cups.cupUniqueId,
        cupType: cups.cupType,
        cupSize: cups.cupSize,
        cupCapacity: cups.cupCapacity + " ml",
        numberOfCups: cups.numberOfCups,
        cupPrice: cups.cupPrice,
        currency: cups.currency,
        points: cups.loyaltyPoints + "/per cup",
        returnTime: cups.returnTime,
      };
      if (cups.cupsAvailable) {
        data.cupsAvailable = cups.cupsAvailable;
      }
      resData.message = `Cup details`;
      resData.cups = data;
    }

    res.status(statusCode).json(resData);
  },

  // b) Coffee Cup History Response
  coffeeCupHistoryResponse: (
    res,
    statusCode,
    cupModelDetails,
    cupHistry,
    isHistory
  ) => {
    let cupTempData;
    let resData = {
      success: true,
      message: "Cup details",
    };

    let coffeeCupData = {
      cupModelUniqueId: cupModelDetails.cupModelUniqueId,
      cupUniqueId: isHistory ? cupHistry.cupUniqueId : null,
      canBeOrdered: isHistory ? (cupHistry.isOrderable ? true : false) : true,
      cupType:
        cupModelDetails.cupType.charAt(0).toUpperCase() +
        cupModelDetails.cupType.slice(1),
      cupSize:
        cupModelDetails.cupSize.charAt(0).toUpperCase() +
        cupModelDetails.cupSize.slice(1),
      description: cupModelDetails.description,
      cupCapacity: cupModelDetails.cupCapacity,
      cupPrice: cupModelDetails.cupPrice,
      currency: cupModelDetails.currency.toUpperCase(),
      cupImages: cupModelDetails.cupImages,
      points: cupModelDetails.loyaltyPoints,
      orderHistory: null,
    };

    if (!isHistory) {
      coffeeCupData.orderHistory = cupHistry;
    } else if (cupHistry.currentCustomer) {
      console.log("cupHistory=>", cupHistry);
      let mn = cupHistry.currentCustomer.middlename
        ? " " +
          cupHistry.currentCustomer.middlename.charAt(0).toUpperCase() +
          cupHistry.currentCustomer.middlename.slice(1) +
          " "
        : " ";
      let temp = {
        currentVendor: {
          cvId: cupHistry.currentVendor._id,
          name:
            cupHistry.currentVendor.name.charAt(0).toUpperCase() +
            cupHistry.currentVendor.name.slice(1),
        },
        currentCustomer: {
          ccId: cupHistry.currentCustomer._id,
          name:
            cupHistry.currentCustomer.firstname.charAt(0).toUpperCase() +
            cupHistry.currentCustomer.firstname.slice(1) +
            mn +
            cupHistry.currentCustomer.lastname.charAt(0).toUpperCase() +
            cupHistry.currentCustomer.lastname.slice(1),
        },
      };
      if (cupHistry.lastVendor) {
        const lastTemp = {
          lvId: cupHistry.lastVendor._id,
          name:
            cupHistry.lastVendor.name.charAt(0).toUpperCase() +
            cupHistry.lastVendor.name.slice(1),
        };
        temp.lastVendor = lastTemp;
      }
      coffeeCupData.orderHistory = temp;
    }

    resData.cupDetails = coffeeCupData;
    res.status(statusCode).json(resData);
  },
};

exports.storeStockResponse = {
  // 1) All vendors store stock information
  allVendorsStoreStockResponse: function (res, statusCode, storeStock) {
    // a) Variable declaration
    let cupData;
    let resData = {
      success: true,
      message: `All vendors stock inforamtion`,
    };

    // b) Prepossing data in required format before sending response
    cupData = storeStock.map((data) => {
      console.log(data);
      const temp = {
        _id: data._id,
        vendorId: data.vendor._id,
        profilePicture: data.vendor.profilePicture,
        name: data.vendor.name,
        email: data.vendor.primaryEmail,
        contactNumber: data.vendor.primaryContactNumber,
        inStock: 0,
      };
      data.cups.forEach((data) => {
        temp.inStock += data.numberOfCups;
      });
      return temp;
    });
    resData.vendorsStocks = cupData;

    // c) Sending response
    res.status(statusCode).json(resData);
  },

  // 2) Single vendor store stock information
  singleVendorStoreStockResponse: function (res, statusCode, storeStock) {
    // a) Variable declaration
    let cupData;
    let resData = {
      success: true,
      message: `Vendor stock information`,
    };

    // b) Prepossing data in required format before sending response
    cupData = {
      _id: storeStock._id,
      vendorId: storeStock.vendor._id,
      name: storeStock.vendor.name,
      email: storeStock.vendor.primaryEmail,
      contactNumber: storeStock.vendor.primaryContactNumber,
      inStock: [],
    };
    storeStock.cups.forEach((data) => {
      if (cupData.inStock.length === 0) {
        const temp = {
          cupType: data.cupID.cupType,
          sizes: [
            {
              cupSizeID: data.cupID._id,
              cupModelUniqueId: data.cupID.cupModelUniqueId,
              cupSize: data.cupID.cupSize,
              capacity: data.cupID.capacity ? data.cupID.capacity : 0,
              cupPrice: data.cupID.cupPrice,
              numberOfCups: data.numberOfCups,
              currency: data.cupID.currency,
            },
          ],
        };
        cupData.inStock.push(temp);
      } else if (cupData.inStock.length !== 0) {
        for (let i = 0; i < cupData.inStock.length; ++i) {
          if (
            cupData.inStock[i].cupType.toLowerCase() ===
            data.cupID.cupType.toLowerCase()
          ) {
            const temp = {
              cupSizeID: data.cupID._id,
              cupModelUniqueId: data.cupID.cupModelUniqueId,
              cupSize: data.cupID.cupSize,
              capacity: data.cupID.capacity ? data.cupID.capacity : 0,
              cupPrice: data.cupID.cupPrice,
              numberOfCups: data.numberOfCups,
              currency: data.cupID.currency,
            };
            cupData.inStock[i].sizes.push(temp);
            break;
          }
        }
      }
    });
    resData.vendorsStocks = cupData;

    // c) Sending response
    res.status(statusCode).json(resData);
  },

  // 3) Stock requests/request
  // cureentStatus: [ {All: 0}, {Pending: 1}, {Accepted: 2}, {Rejected: 3}]
  // user: [ { Admin: 1}, { Vendor: 2}, {default: 0}]
  storeStockRequestsResponse: function (
    res,
    statusCode,
    requests,
    isList,
    currentStatus
  ) {
    let stockRequests;
    let respData = {
      success: true,
      message: "",
    };

    if (isList) {
      stockRequests = requests.map((data) => {
        let temp = {
          _id: data._id,
          approvalStatus: data.approvalStatus,
          requestStatus: data.requestStatus,
          isDeliveryConfirm: data.isDeliveryConfirm,
          vendor: {
            vendorID: data.vendor._id,
            name: data.vendor.name,
            email: data.vendor.primaryEmail,
            countryCode: data.countryCode,
            contactNumber: data.contactNumber,
          },
          dateOfRequest: data.dateOfRequest,
          cupsRequested: [],
          shippingAddress: data.shippingAddress,
        };
        temp.cupsRequested = data.cupsRequested.map((data) => {
          let temp = {
            cupID: data.cupID._id,
            cupModelUniqueId: data.cupID.cupModelUniqueId,
            cupType: data.cupID.cupType,
            cupSize: data.cupID.cupSize,
            cupCapacity: data.cupID.cupCapacity,
            cupPrice: data.cupID.cupPrice,
            currency: data.cupID.currency,
            numberOfCups: data.numberOfCups,
          };
          return temp;
        });
        return temp;
      });
      switch (currentStatus) {
        case 1:
          respData.message = "All pending stock requests";
          break;
        case 2:
          respData.message = "All rejected stock requests";
          break;
        case 3:
          respData.message = "All accepted stock requests";
          break;
        default:
          respData.message = "All stock requests";
      }
      respData.length = stockRequests.length;
      respData.stockRequest = stockRequests;
    } else if (!isList) {
      stockRequests = {
        _id: requests._id,
        approvalStatus: requests.approvalStatus,
        requestStatus: requests.requestStatus,
        isDeliveryConfirm: requests.isDeliveryConfirm,
        vendor: {
          vendorID: requests.vendor._id,
          name: requests.vendor.name,
          email: requests.vendor.primaryEmail,
          countryCode: requests.countryCode,
          contactNumber: requests.contactNumber,
        },
        dateOfRequest: requests.dateOfRequest,
        cupsRequested: [],
        shippingAddress: requests.shippingAddress,
      };
      stockRequests.cupsRequested = requests.cupsRequested.map((data) => {
        let temp = {
          cupID: data.cupID._id,
          cupModelUniqueId: data.cupID.cupModelUniqueId,
          cupType: data.cupID.cupType,
          cupSize: data.cupID.cupSize,
          cupCapacity: data.cupID.cupCapacity,
          cupPrice: data.cupID.cupPrice,
          currency: data.cupID.currency,
          numberOfCups: data.numberOfCups,
        };
        return temp;
      });
      respData.message = "Stock request information";
      respData.stockRequest = stockRequests;
    }

    res.status(statusCode).json(respData);
  },

  vendorStoreStockByCustomer: function (res, statusCode, vendor, storeStock) {
    // a) Variable declaration
    let resData = {
      success: true,
      message: `Vendor stock information`,
    };
    // b) Prepossing data in required format before sending response
    const responseData = {
      _id: storeStock._id,
      vendor: vendor._id,
      name: vendor.name,
      contact: "+" + vendor.countryCode + " " + vendor.primaryContactNumber,
      profilePicture: vendor.profilePicture ? vendor.profilePicture : null,
      address: "",
      primaryEmail: vendor.primaryEmail,
      cups: false,
      storeGallery: false,
    };
    if (vendor.plotnumber) {
      responseData.address += vendor.plotnumber + ", ";
    }
    if (vendor.address) {
      responseData.address += vendor.address + " ";
    }
    if (vendor.city) {
      responseData.address += vendor.city + " ";
    }
    if (vendor.state) {
      responseData.address += vendor.state + ", ";
    }
    if (vendor.country) {
      responseData.address += vendor.country + " ";
    }
    if (vendor.zipCode) {
      responseData.address += vendor.zipCode + " ";
    }

    if (vendor.storeImages) {
      responseData.storeGallery = vendor.storeImages;
    }

    if (storeStock) {
      responseData.cups = storeStock.cups.map((data) => {
        const temp = {
          cupID: data.cupID._id,
          cupType: data.cupID.cupType,
          cupSize: data.cupID.cupSize,
          cupPrice: data.cupID.cupPrice,
          currency: data.cupID.currency || "RM",
          points: data.cupID.loyaltyPoints,
        };
        return temp;
      });
    }
    resData.vendorStock = responseData;

    // c) Sending response
    res.status(statusCode).json(resData);
  },
};

exports.scannedCupResponse = {
  // 1) After scan response
  cupDetailsAfterCupScan: function (
    res,
    statusCode,
    cupDetails,
    orderHistory,
    uniqueID,
    returnCondition
  ) {
    // a) Cup details after scan
    let resData = {
      success: true,
      message: `All vendors stock inforamtion`,
    };

    let returnData = {
      _id: cupDetails._id,
      modelID: cupDetails.cupModelUniqueId,
      cupType:
        cupDetails.cupType.charAt(0).toUpperCase() +
        cupDetails.cupType.slice(1),
      cupSize:
        cupDetails.cupSize.charAt(0).toUpperCase() +
        cupDetails.cupSize.slice(1),
      capacity: cupDetails.cupCapacity + " ml",
      price: cupDetails.cupPrice,
      currency: cupDetails.currency.toUpperCase(),
      points: cupDetails.loyaltyPoints,
      images: cupDetails.cupImages,
      canOrder: null,
      cupHistory: {},
      returnCondition: returnCondition,
    };

    if (orderHistory) returnData.canOrder = false;
    else returnData.canOrder = true;
    if (orderHistory) {
    } else {
      returnData.cupHistory = {
        uniqueID: uniqueID,
        canOrder: true,
        history: "No order data available",
      };
    }

    resData.cupData = returnData;

    // c) Sending response
    res.status(statusCode).json(resData);
  },
};

exports.orderCupsResponse = {
  returnedCupsResponse: function (res, statusCode, returedCups) {
    // Response object
    let resData = {
      success: true,
      message: `All returned cups`,
    };
    // {
    //     "_id": "6561acdb90854c7facbd3448",
    //     "tnxID": "6561acc490854c7facbd343b",
    //     "orderStatus": "SUCCESS",
    //     "orderTime": "2023-11-25T08:14:19.092Z",
    //     "customer": {
    //         "_id": "65609c60ec7ee3dbb5750104",
    //         "primaryEmail": "kumarshreyash98@gmail.com",
    //         "countryCode": 91,
    //         "primaryContactNumber": 9087654321,
    //         "firstname": "Shreyash",
    //         "lastname": "Gaur",
    //         "middlename": "Kumar"
    //     },
    //     "fromVendor": "652f8ccc1b110bbf7b407b85",
    //     "orderAmount": 10,
    //     "currency": "usd",
    //     "offers": [],
    //     "createdAt": "2023-11-25T08:14:19.095Z",
    //     "updatedAt": "2023-11-25T10:13:10.923Z",
    //     "__v": 0,
    //     "cupModelUniqueId": "CHIPT3TRS13EOSD",
    //     "cupUniqueId": "8539UGREVBGHET"
    // }

    const returned_Cups = returedCups.map((data) => {
      let temp = {
        _id: data._id,
        tnxID: data.tnxID,
        orderStatus: data.orderStatus,
        orderTime: data.orderTime,
        amount: data.orderAmount,
        currency: data.currency,
        returnedCup: {
          modelID: data.cupModelUniqueId,
          uniqueId: data.cupUniqueId,
          cupType: data.cupID.cupType,
          cupSize: data.cupID.cupSize,
          cupImages: data.cupID.cupImages,
        },
        customer: {
          customerID: data.customer._id,
          name: "",
          email: data.customer.primaryEmail,
          contact: "",
        },
        fromVendor: {
          vendorID: data.fromVendor._id,
          name: data.fromVendor.name,
          email: data.fromVendor.primaryEmail,
          contact: "",
        },
        returnedVendor: {
          vendorID: data.fromVendor._id,
          name: data.fromVendor.name,
          email: data.fromVendor.primaryEmail,
          contact: "",
        },
      };
      let firstname = data.customer.firstname
        ? data.customer.firstname + " "
        : "";
      let middlename = data.customer.middlename
        ? data.customer.middlename + " "
        : "";
      let lastname = data.customer.lastname ? data.customer.lastname : "";
      temp.customer.name = firstname + middlename + lastname;
      let customerCountryCode = data.customer.countryCode
        ? "+" + data.customer.countryCode
        : "";
      let customerContact = data.customer.primaryContactNumber
        ? data.customer.primaryContactNumber
        : "";
      temp.customer.contact = customerCountryCode + customerContact;

      let vnedorCountryCode_F = data.fromVendor.countryCode
        ? "+" + data.fromVendor.countryCode
        : "";
      let vendorContact_F = data.fromVendor.primaryContactNumber
        ? data.fromVendor.primaryContactNumber
        : "";
      temp.fromVendor.contact = vnedorCountryCode_F + vendorContact_F;

      let vnedorCountryCode_R = data.returnedVendor.countryCode
        ? "+" + data.returnedVendor.countryCode
        : "";
      let vendorContact_R = data.returnedVendor.primaryContactNumber
        ? data.returnedVendor.primaryContactNumber
        : "";
      temp.returnedVendor.contact = vnedorCountryCode_R + vendorContact_R;

      return temp;
    });

    resData.returned_Cups = returned_Cups;
    res.status(statusCode).json(resData);
  },
};
