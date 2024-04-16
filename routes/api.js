var express = require("express");
var authRouter = require("./auth");
var picture = require("./uploadRoute");

var app = express();

app.use("/auth/", authRouter);
app.use("/pictures", picture);

module.exports = app;