// Module Imports
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const NodeGeocoder = require("node-geocoder");
const cron = require("node-cron");
const Orders = require("./models/Orders/Order.js");
const Cups = require("./models/Cups/Cup.js");
const sendEmail = require("./utils/sendMails.js");

const app = express();
app.use(cors({ credentials: true, origin: true }));
// Configurations
dotenv.config({ path: "./config/config.env" });
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("common"));
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const options = {
  provider: "google",
  apiKey: apiKey,
};
const geocoder = NodeGeocoder(options);
const googleMapsClient = require("@google/maps").createClient({
  key: process.env.apiKey,
});

// MiddleWare Imports
const errorMiddleware = require("./errors/error.js");
const APIRouteTable = require("./routes/APIRouteTable.js");

// Job Scheduler
cron.schedule("0 */12 * * *", async () => {
  const order = await Orders.find({
    orderStatus: "pending",
    orderTime: { $lt: Date.now() },
  });
  await Orders.updateMany(
    { orderStatus: "pending", orderTime: { $lt: Date.now() } },
    { orderStatus: "failed" }
  );
  console.log("Order status updated");
});

cron.schedule("0 0 */2 * *", async () => {
  //   const cups = await Cups.find({currentCustomer: {$ne: undefined}});
  const userCups = await Cups.find({
    isOrderable: false,
    orderDate: { $lt: new Date() },
    currentCustomer: { $ne: null || undefined },
    isActive: true,
  })
    .select("cupID currentCustomer orderDate")
    .populate("cupID", "cupSize cupType returnTime")
    .populate("currentCustomer", "primaryEmail");

  for (const user of userCups) {
    let returnDate =
      user.cupID.returnTime * 86400000 + user.orderDate.getTime();
    let message = `Dear customer,\n\nCup ${
      user.cupID.cupType.charAt(0).toUpperCase() + user.cupID.cupType.slice(1)
    } (size: ${
      user.cupID.cupSize.charAt(0).toUpperCase() + user.cupID.cupSize.slice(1)
    }) ordered by you on ${new Date(
      user.orderDate
    ).toDateString()} is pending for return. Please return it before ${new Date(
      returnDate
    ).toDateString()}.\n\nThanks,\nChipt Asia`;
    try {
      await sendEmail({
        email: user.currentCustomer.primaryEmail,
        subject: "Chipt Cup Return Alert",
        message,
      });
    } catch (error) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
});

// // const job = cron.schedule('0 */12 * * *', async () => {
//   cron.schedule('0/2 * * * *', async () => {
//     try {

//         // =============================
//         // Calculate the date 28 days ago
//         const date28DaysAgo = new Date();
//         date28DaysAgo.setDate(date28DaysAgo.getDate() - 28);

//         // Calculate the date 29 days ago
//         const date29DaysAgo = new Date();
//         date29DaysAgo.setDate(date29DaysAgo.getDate() - 29);
//         console.log(date28DaysAgo)

//         // MongoDB aggregation query to fetch data falling between 28 to 29 days in the past
//         // Cups.aggregate([
//         //     {
//         //         $match: {
//         //           orderDate: {
//         //             $gte: date29DaysAgo,
//         //             $lt: date28DaysAgo
//         //           },
//         //           isOrderable: false
//         //         }
//         //       },
//         //       {
//         //         $addFields: {
//         //           currentCustomer: "$currentCustomer"
//         //         }
//         //       }
//         // ]);
//         // =============================
//         // for (const user of users) {
//         //     const mailOptions = {
//         //         from: 'your_email@youremail.com',
//         //         to: user.email,
//         //         subject: 'Your Custom Message',
//         //         text: user.message // Personalize the message using user.message
//         //     };

//         //     await transporter.sendMail(mailOptions);
//         //     console.log(`Email sent to ${user.email}`);
//         // }
//     } catch (error) {
//         console.error('Error sending emails:', error);
//     }
// });

// Project Routes
app.use("/api/v1/", APIRouteTable);

// Error Middleware
app.use(errorMiddleware);

module.exports = app;
