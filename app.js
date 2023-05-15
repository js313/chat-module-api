var express = require("express");
const http = require("http");
var logger = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

var indexRouter = require("./src/routes/index.js").routes;
var app = express();
app.use(cors("*"));
app.use(logger("dev"));
// app.use(express.static('static'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const socketServer = require("./socketServer");
const server = http.createServer(app);
socketServer.registerSocketServer(server);

app.get("/", async function (req, res, next) {
  res.status(200).send("successully connected");
});

app.use("/api", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).json({
    message: "No such route exists",
  });
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    message: "Error Message",
    error: err.message,
  });
});
server.listen(4001, function () {
  console.log("listening on port : http://localhost:4001");
});

module.exports = app;
