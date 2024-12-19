// BuiltIn Module Import

// Database Import
const Customer = require("../../models/Customer/Customer.js");
const Orders = require("../../models/Orders/Order.js");
const Transactions = require("../../models/Orders/Transactions.js");

// User Created Module Import
const CatchAsync = require("../../errors/catchAsync.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const { customerResponses } = require("../../utils/responseObjects.js");

/*
    Index:
        01) Customers list
        02) Customer information
        03) Enable/Disable customer account
        04) Enabled customers account
        05) Disabled customers list
        06) All customers orders list
        07) All customers order from a vendor
        08) All customers transactions
        09) All customer payment to a vendor
        10) Single customer orders list
        11) Single customer order from a vendor
        12) Single customer single order details
        13) Single customer all transactions
        14) Customer all transactions to vendor
        15) Single customer single transaction
*/

// 01) ✅ UTILS: Customers list
exports.projectName_Utils_All_Customers_List = CatchAsync(
  async (req, res, next) => {
    // a) Fetching all customers
    const customers = await Customer.find().select(
      "+accountActive +accountVerified +firstname +middlename +lastname profilePicture primaryEmail countryCode primaryContactNumber +plotnumber +address +city +state +country +zipCode +location name"
    );

    // b) Checking for error
    if (!customers || customers.length === 0) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // c) Sending response
    customerResponses.customersListInformation(
      res,
      200,
      customers,
      true,
      "All customers"
    );
  }
);

// 02) ✅ UTILS: Customer information
exports.projectName_Utils_Cusotmer_Account_Information = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring params id
    const customerID = req.params.id;

    // b) Fetching customer information
    const customer = await Customer.findById({ _id: customerID })
      .select(
        "+accountActive +accountVerified +firstname +middlename +lastname profilePicture primaryEmail countryCode primaryContactNumber name"
      )
      .catch((err) => {
        return next(new ErrorHandler(`Something went wrong`, 404));
      });

    // b) Checking for error
    if (!customer) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // c) Sending response
    customerResponses.customersListInformation(res, 200, customer, false);
  }
);

// 03) ✅ UTILS: Enable/Disable customer account
exports.projectName_Utils_Customer_Account_Enable_Disable = CatchAsync(
  async (req, res, next) => {
    // a) Destructuring params id
    const customerID = req.params.id;

    // b) Fetching customer information
    const customer = await Customer.findById({ _id: customerID })
      .select("+accountActive +accountVerified +isBlocked")
      .catch((err) => {
        return next(new ErrorHandler(`Something went wrong`, 404));
      });

    // c) Checking for error
    if (!customer) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // d) Checking if customer account is verified
    if (!customer.accountVerified) {
      return next(
        new ErrorHandler(`Customer account is not verified yet`, 200)
      );
    }

    // e) Changing account status as per previous state
    let customerStatus = customer.customer;
    if (customer.accountVerified && customer.accountActive) {
      customer.accountActive = false;
      customer.isBlocked = true;
    } else if (customer.accountVerified && !customer.accountActive) {
      customer.accountActive = true;
      customer.isBlocked = false;
    }
    await customer.save();

    // c) Sending response
    res.status(200).json({
      success: true,
      message: `Customer account is ${
        customerStatus ? "Disabled." : "Enabled."
      }`,
    });
  }
);

// 04) ✅ UTILS: Enable customers account
exports.projectName_Utils_Active_Customers_Account_List = CatchAsync(
  async (req, res, next) => {
    // a) Fetching all active customers
    const customers = await Customer.find({ accountActive: true }).select(
      "+accountActive +accountVerified +firstname +middlename +lastname profilePicture primaryEmail countryCode primaryContactNumber name"
    );

    // b) Checking for error
    if (!customers || customers.length === 0) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // c) Sending response
    customerResponses.customersListInformation(
      res,
      200,
      customers,
      true,
      "All active customers"
    );
  }
);

// 05) ✅ UTILS: Disabled customers list
exports.projectName_Utils_InActive_Customers_Account_List = CatchAsync(
  async (req, res, next) => {
    // a) Fetching all active customers
    const customers = await Customer.find({ accountActive: false }).select(
      "+accountActive +accountVerified +firstname +middlename +lastname profilePicture primaryEmail countryCode primaryContactNumber name"
    );

    // b) Checking for error
    if (!customers || customers.length === 0) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // c) Sending response
    customerResponses.customersListInformation(
      res,
      200,
      customers,
      true,
      "All inactive customers"
    );
  }
);

// 06) ✅ UTILS: All customers orders
exports.projectName_Utils_All_Customers_Orders_List = CatchAsync(
  async (req, res, next) => {
    // a) Fetching all orders
    const orders = await Orders.find().sort({ createdAt: -1 });

    // b) Checking for error
    if (!orders || orders.length === 0) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // c) Sending response
    res.status(200).json({
      success: true,
      message: "All orders",
      orders,
    });
  }
);

// 07) ✅ UTILS: All customers order from a vendor
exports.projectName_Utils_Customers_Orders_From_Vendor = CatchAsync(
  async (req, res, next) => {
    // a) Fetching order ID
    const vendorID = req.params.id;

    // b) Fetching customer all orders
    const orders = await Orders.find({ vendor: vendorID });

    // c) Checking for error
    if (!orders || orders.length === 0) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // d) Sending response
    res.status(200).json({
      success: true,
      message: "Customers order from a vendor",
      orders,
    });
  }
);

// 08) ✅ UTILS: All customers transactions
exports.projectName_Utils_All_Customers_Transactions_List = CatchAsync(
  async (req, res, next) => {
    // a) Fetching customer all orders
    const transactions = await Transactions.find();

    // c) Checking for error
    if (!transactions || transactions.length === 0) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // d) Sending response
    res.status(200).json({
      success: true,
      message: "Customers transactions",
      transactions,
    });
  }
);

// 09) ✅ UTILS: All customers payment to a vendor
exports.projectName_Utils_Customers_All_Transactions_To_Vendor = CatchAsync(
  async (req, res, next) => {
    // a) Fetching customer ID
    const vendorID = req.params.id;

    // b) Fetching customer all orders
    const transactions = await Transactions.find({ vendor: vendorID }).catch(
      (err) => {
        return next(new ErrorHandler(`No data found`, 404));
      }
    );

    // c) Checking for error
    if (!transactions || transactions.length === 0) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // d) Sending response
    res.status(200).json({
      success: true,
      message: "Customer transactions",
      transactions,
    });
  }
);

// 10) ✅ UTILS: Single customer orders list
exports.projectName_Utils_Single_Customer_Orders_List = CatchAsync(
  async (req, res, next) => {
    // a) Fetching customer ID
    const customerID = req.params.id;

    // b) Fetching customer all orders
    const orders = await Orders.find({ cutomer_id: customerID }).sort({
      createdAt: -1,
    });

    // c) Checking for error
    if (!orders || orders.length === 0) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // d) Sending response
    res.status(200).json({
      success: true,
      message: "All orders",
      orders,
    });
  }
);

// 11) ✅UTILS: Customer single order details
exports.projectName_Utils_Single_Customer_Order_Information = CatchAsync(
  async (req, res, next) => {
    // a) Fetching order ID
    const orderID = req.params.id;

    // b) Fetching customer all orders
    const order = await Orders.findById({ _id: orderID }).catch((err) => {
      if (err) return next(new ErrorHandler(`Something went wrong`, 404));
    });

    // c) Checking for error
    if (!order) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // d) Sending response
    res.status(200).json({
      success: true,
      message: "Single order",
      order,
    });
  }
);

// 12) ✅ UTILS: Single customer order from a vendor
exports.projectName_Utils_Customer_Orders_From_Vendor = CatchAsync(
  async (req, res, next) => {
    // a) Fetching order ID
    const customerID = req.body.customer;
    const vendorID = req.body.vendor;

    // b) Fetching customer all orders
    const orders = await Orders.find({
      customer: customerID,
      vendor: vendorID,
    });

    // c) Checking for error
    if (!orders || orders.length === 0) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // d) Sending response
    res.status(200).json({
      success: true,
      message: "Customer orders from a vendor",
      orders,
    });
  }
);

// 13) ✅ UTILS: Single customer all transactions
exports.projectName_Utils_Customer_All_Transactions_List = CatchAsync(
  async (req, res, next) => {
    // a) Fetching customer ID
    const customerID = req.params.id;

    // b) Fetching customer all orders
    const transactions = await Transactions.find({
      customer: customerID,
    }).catch((err) => {
      return next(new ErrorHandler(`Something went wrong`, 404));
    });

    // c) Checking for error
    if (!transactions || transactions.length === 0) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // d) Sending response
    res.status(200).json({
      success: true,
      message: "Customer transactions",
      transactions,
    });
  }
);

// 14) ✅ UTILS: Customer transaction to a vendor
exports.projectName_Utils_Customer_All_Transactions_To_Vendor = CatchAsync(
  async (req, res, next) => {
    // a) Fetching customer ID
    const vendorID = req.body.vendor;
    const customerID = req.body.customer;

    // b) Fetching customer all orders
    const transactions = await Transactions.find({
      vendor: vendorID,
      customer: customerID,
    }).catch((err) => {
      return next(new ErrorHandler(`Something went wrong`, 404));
    });

    // c) Checking for error
    if (!transactions || transactions.length === 0) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // d) Sending response
    res.status(200).json({
      success: true,
      message: "Customer transactions",
      transactions,
    });
  }
);

// 15) ✅ UTILS: Customer single transaction
exports.projectName_Utils_Customer_Single_Transaction_Informatiom = CatchAsync(
  async (req, res, next) => {
    // a) Fetching customer ID
    const txnID = req.params.id;

    // b) Fetching customer all orders
    const transaction = await Transactions.findById({ _id: txnID }).catch(
      (err) => {
        return next(new ErrorHandler(`Something went wrong`, 404));
      }
    );

    // c) Checking for error
    if (!transaction) {
      return next(new ErrorHandler(`No data found`, 200));
    }

    // d) Sending response
    res.status(200).json({
      success: true,
      message: "Customer transactions",
      transaction,
    });
  }
);

// 16) Customer added based on months
exports.projectName_Utils_Customers_Added_Month_Based = CatchAsync(
  async (req, res, next) => {
    // Fetching year
    const currentDate = new Date();
    const currentYr = currentDate.getFullYear();
    const currentMnth = currentDate.getMonth() + 1;
    let yrs;
    if (req.query) {
      yrs = req.query.yrs;
    } else {
      yrs = currentYr;
    }

    let customerChart;

    if (yrs <= currentYr) {
      customerChart = {
        january:
          currentMnth >= 1
            ? await Customer.count({
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, yrs] },
                    { $eq: [{ $month: "$createdAt" }, 1] },
                  ],
                },
              })
            : null,
        feburary:
          currentMnth >= 2
            ? await Customer.count({
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, yrs] },
                    { $eq: [{ $month: "$createdAt" }, 2] },
                  ],
                },
              })
            : null,
        march:
          currentMnth >= 3
            ? await Customer.count({
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, yrs] },
                    { $eq: [{ $month: "$createdAt" }, 3] },
                  ],
                },
              })
            : null,
        april:
          currentMnth >= 4
            ? await Customer.count({
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, yrs] },
                    { $eq: [{ $month: "$createdAt" }, 4] },
                  ],
                },
              })
            : null,
        may:
          currentMnth >= 5
            ? await Customer.count({
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, yrs] },
                    { $eq: [{ $month: "$createdAt" }, 5] },
                  ],
                },
              })
            : null,
        june:
          currentMnth >= 6
            ? await Customer.count({
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, yrs] },
                    { $eq: [{ $month: "$createdAt" }, 6] },
                  ],
                },
              })
            : null,
        july:
          currentMnth >= 7
            ? await Customer.count({
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, yrs] },
                    { $eq: [{ $month: "$createdAt" }, 7] },
                  ],
                },
              })
            : null,
        august:
          currentMnth >= 8
            ? await Customer.count({
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, yrs] },
                    { $eq: [{ $month: "$createdAt" }, 8] },
                  ],
                },
              })
            : null,
        september:
          currentMnth >= 9
            ? await Customer.count({
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, yrs] },
                    { $eq: [{ $month: "$createdAt" }, 9] },
                  ],
                },
              })
            : null,
        october:
          currentMnth >= 10
            ? await Customer.count({
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, yrs] },
                    { $eq: [{ $month: "$createdAt" }, 10] },
                  ],
                },
              })
            : null,
        november:
          currentMnth >= 11
            ? await Customer.count({
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, yrs] },
                    { $eq: [{ $month: "$createdAt" }, 11] },
                  ],
                },
              })
            : null,
        december:
          currentMnth >= 12
            ? await Customer.count({
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, yrs] },
                    { $eq: [{ $month: "$createdAt" }, 12] },
                  ],
                },
              })
            : null,
      };
    } else if (yrs > currentYr) {
      customerChart = `Data for ${yrs} not found.`;
    }

    res.status(200).json({
      success: true,
      message: `Customers added in ${yrs}`,
      customerChart,
    });
  }
);
