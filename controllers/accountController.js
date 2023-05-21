const { body, validationResult } = require("express-validator");
const passport = require("passport");
const { hashPassword } = require("../utils/authenticationUtils");
const User = require("../models/user.model");

const getSignUpPage = (req, res) => {
  const { firstName, lastName, username } = req.session;
  res.render("sign-up", { firstName, lastName, username });
};

const validateSignUpDetails = [
  body("firstName")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("First name must not be empty.")
    .isString(),
  body("lastName")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Last name must not be empty.")
    .isString(),
  body("username")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Username must not be empty.")
    .isString(),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Password must be confirmed.")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords must match."),
  (req, res, next) => {
    const result = validationResult(req);
    if (result.errors.length) {
      req.session.firstName = req.body.firstName;
      req.session.lastName = req.body.lastName;
      req.session.username = req.body.username;
      res.redirect("/account/sign-up");
    } else {
      next();
    }
  },
];

const createAccount = async (req, res, next) => {
  try {
    const { firstName, lastName, username, password } = req.body;
    const existingUsername = await User.findOne({ username }).exec();
    if (existingUsername) {
      res.redirect("/account/sign-up");
      return;
    }
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      roles: ["User"],
    });
    const newUserDocument = await newUser.save();
    console.log(
      `Successfully created and saved User ID ${newUserDocument._id}`
    );
    res.redirect("/account/log-in");
  } catch (err) {
    console.error(
      "There was an issue with database operations while creating an account."
    );
    err.status = 500;
    next(err);
  }
};

const postHandleSignUp = [validateSignUpDetails, createAccount];

const getLogInPage = (req, res) => {
  res.render("log-in");
};

const postLogIn = passport.authenticate("local", {
  successRedirect: "/post",
  failureRedirect: "/account/log-in",
});

const getMemberPage = (req, res, next) => {
  if (!req.user) {
    next();
  }
  res.render("member", { user: req.user });
};

const postHandleMembership = async (req, res, next) => {
  try {
    if (!req.user) {
      next();
    }
    if (req.body.password !== process.env.MEMBER_PASSWORD) {
      res.redirect("/account/member");
      return;
    }
    const user = await User.findById(req.user.id).exec();
    user.roles.push("Member");
    await user.save();
    res.redirect("/post");
  } catch (err) {
    console.error(
      "There was an issue with database operations while granting Member status."
    );
    err.status = 500;
    next(err);
  }
};

const getAdminPage = (req, res, next) => {
  if (!req.user || !req.user.isMember) {
    next();
  }
  res.render("admin", { user: req.user });
};

const postHandleGrantAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      next();
    }
    if (req.body.password !== process.env.ADMIN_PASSWORD) {
      res.redirect("/account/admin");
      return;
    }
    const user = await User.findById(req.user.id).exec();
    user.roles.push("Admin");
    await user.save();
    res.redirect("/post");
  } catch (err) {
    console.error(
      "There was an issue with database operations while granting Admin status."
    );
    err.status = 500;
    next(err);
  }
};

module.exports = {
  getSignUpPage,
  postHandleSignUp,
  getLogInPage,
  postLogIn,
  getMemberPage,
  postHandleMembership,
  getAdminPage,
  postHandleGrantAdmin,
};
