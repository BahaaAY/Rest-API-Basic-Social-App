const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");
const e = require("express");

const username = require("./util/credentials").username;
const password = require("./util/credentials").password;

const MONGODB_URI = `mongodb+srv://${username}:${password}@cluster0.o8mxmhh.mongodb.net/social`;

const app = express();
app.use((req, res, next) => {
  // Fix CORS error
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});
app.use(bodyParser.json()); // parse application/json
app.use("/feed", feedRoutes);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("Connected to MongoDB");
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
