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
const Customer = require("./models/Customer/Customer.js");
const CustomerWallet = require("./models/Customer/CustomerWallet.js");

// Job Scheduler
// cron.schedule("0 */12 * * *", async () => {
//   const order = await Orders.find({
//     orderStatus: "pending",
//     orderTime: { $lt: Date.now() },
//   });
//   await Orders.updateMany(
//     { orderStatus: "pending", orderTime: { $lt: Date.now() } },
//     { orderStatus: "failed" }
//   );
//   console.log("Order status updated");
// });

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

cron.schedule("0 */12 * * *", async () => {
  console.log("Running cron job to check for overdue cup returns");

  try {
    const overdueCups = await Cups.find({
      isOrderable: false,
      orderDate: { $lt: new Date() },
      currentCustomer: { $ne: null },
      isActive: true,
    })
      .select("cupID currentCustomer orderDate")
      .populate("cupID", "cupSize cupType returnTime")
      .populate("currentCustomer", "primaryEmail isBlocked");

    for (const userCup of overdueCups) {
      const returnDate =
        userCup.cupID.returnTime * 86400000 + userCup.orderDate.getTime();
      const overdue = new Date() > new Date(returnDate);

      if (overdue && !userCup.currentCustomer.isBlocked) {
        // Block the customer
        const customer = await Customer.findById(userCup.currentCustomer._id);
        const wallet = await CustomerWallet.find({
          customer: userCup.currentCustomer._id,
        });
        let walletCredit = false;
        if (wallet) {
          if (wallet.cupCredits && wallet.cupCredits > 15) {
            wallet.cupCredits -= 15;
            walletCredit = true;
          } else {
            wallet.securityDeposit = 0;
            wallet.isWalletActive = false;
          }
          await wallet.save();
        }
        if (customer) {
          if (walletCredit) {
            const message = `Dear customer,\n\nCup ${
              userCup.cupID.cupType.charAt(0).toUpperCase() +
              userCup.cupID.cupType.slice(1)
            } (size: ${
              userCup.cupID.cupSize.charAt(0).toUpperCase() +
              userCup.cupID.cupSize.slice(1)
            }) ordered by you on ${new Date(
              userCup.orderDate
            ).toDateString()} is overdue for return. 15 credits have been deducted from your wallet. Please return the cup as soon as possible.\n\nThanks,\nChipt Asia`;
            try {
              await sendEmail({
                email: userCup.currentCustomer.primaryEmail,
                subject: "Chipt Cup Return Overdue - Credits Deducted",
                message,
              });
              console.log(
                `Email sent to ${userCup.currentCustomer.primaryEmail}`
              );
            } catch (error) {
              console.error(
                `Failed to send email to ${userCup.currentCustomer.primaryEmail}:`,
                error.message
              );
            }
          } else {
            customer.isBlocked = true;
            await customer.save();
            const message = `Dear customer,\n\nCup ${
              userCup.cupID.cupType.charAt(0).toUpperCase() +
              userCup.cupID.cupType.slice(1)
            } (size: ${
              userCup.cupID.cupSize.charAt(0).toUpperCase() +
              userCup.cupID.cupSize.slice(1)
            }) ordered by you on ${new Date(
              userCup.orderDate
            ).toDateString()} is overdue for return. Please return it as soon as possible. Your account has been blocked due to this overdue.\n\nThanks,\nChipt Asia`;
            try {
              await sendEmail({
                email: userCup.currentCustomer.primaryEmail,
                subject: "Chipt Cup Return Overdue - Account Blocked",
                message,
              });
              console.log(
                `Email sent to ${userCup.currentCustomer.primaryEmail}`
              );
            } catch (error) {
              console.error(
                `Failed to send email to ${userCup.currentCustomer.primaryEmail}:`,
                error.message
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error running cron job:", error);
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

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// Error Middleware
app.use(errorMiddleware);

module.exports = app;
