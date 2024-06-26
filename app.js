const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();

const compression = require("compression");
const helmet = require("helmet");
const RateLimiter = require("express-rate-limit");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const catalogRouter = require("./routes/catalog");

const app = express();

app.use(
  RateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
  })
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["self", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.DATABASE_CON_STR;
// "mongodb+srv://mattHudson:DP4dNl1CZpV1fMe1@locallibrary.5udpszx.mongodb.net/local_library?retryWrites=true&w=majority&appName=LocalLibrary";

async function main() {
  await mongoose.connect(mongoDB);
}

main().catch((err) => console.log(err));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(compression());

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/catalog", catalogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
