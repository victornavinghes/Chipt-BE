const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const app = require("./app.js");
const PORT = process.env.PORT || 5000;
const https = require("https");
const path = require("path");
const express = require("express");

const fs = require("fs");
// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// UncaughtException Error
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Database connection successful...`);
  });

const server = app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`Yeah! Server is running at port: ${PORT}`);
});

// const server = app.listen(PORT, "0.0.0.0", (err) => {
//   if (err) console.log(err);
//   console.log(`Yeah! Server is running at port: ${PORT}`);
// });

// app.use(express.static(path.join(__dirname, "build")));
// app.use(
//   "/chiptadmin",
//   express.static(path.join(__dirname, "/chiptadmin/admin_build"))
// );
// app.use(
//   "/chiptvendor",
//   express.static(path.join(__dirname, "/chiptvendor/vendor_build"))
// );

// app.get("/chiptadmin/*", function (req, res) {
//   res.sendFile(path.join(__dirname, "chiptadmin/admin_build", "index.html"));
// });
// app.get("/chiptvendor/*", function (req, res) {
//   res.sendFile(path.join(__dirname, "chiptvendor/vendor_build", "index.html"));
// });
// app.get("/*", function (req, res) {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });
// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
