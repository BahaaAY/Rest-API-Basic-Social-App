const express = require("express");
const bodyParser = require("body-parser");

const feedRoutes = require("./routes/feed");

const app = express();

app.use(bodyParser.json()); // parse application/json
app.use("/feed", feedRoutes);

app.listen(8080);
