const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const methodOverride = require("method-override");

const {
  authenticateLogInCredentials,
  saveUserId,
  getUserFromId,
} = require("./utils/authenticationUtils");

const accountRouter = require("./routes/account");
const postRouter = require("./routes/post");

const app = express();

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
}

main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 14 },
  })
);
passport.use(authenticateLogInCredentials);
passport.serializeUser(saveUserId);
passport.deserializeUser(getUserFromId);
app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/account", accountRouter);
app.use("/post", postRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", { user: req.user });
});

module.exports = app;
