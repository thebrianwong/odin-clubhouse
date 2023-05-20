const { body, validationResult } = require("express-validator");
const passport = require("passport");
const { hashPassword } = require("../utils/authenticationUtils");
const User = require("../models/user.model");

const getSignUpPage = (req, res) => {
  res.render("sign-up");
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
      // Redirect to sign up page with form filled with entered details
      res.status(401).send("errors");
    } else {
      next();
    }
  },
];

const createAccount = async (req, res, next) => {
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
  console.log(`Successfully created and saved User ID ${newUserDocument._id}`);
  // redirect to login page
  res.redirect("/account/log-in");
};

const postHandleSignUp = [validateSignUpDetails, createAccount];

const getLogInPage = (req, res) => {
  res.render("log-in");
};

const postLogIn = passport.authenticate("local", {
  successRedirect: "/post",
  failureRedirect: "/account/log-in",
});

const getMemberPage = (req, res) => {
  if (!req.user) {
    res.status(403).send("Unauthorized");
    return;
  }
  res.render("member", { user: req.user });
};

const postHandleMembership = async (req, res) => {
  if (!req.user) {
    res.status(403).send("Unauthorized");
  }
  if (req.body.password !== process.env.MEMBER_PASSWORD) {
    res.redirect("/account/member");
    return;
  }
  const user = await User.findById(req.user.id);
  user.roles.push("Member");
  await user.save();
  res.redirect("/post");
};

const getAdminPage = (req, res) => {
  if (!req.user || !req.user.isMember) {
    res.status(403).send("Unauthorized");
    return;
  }
  res.render("admin", { user: req.user });
};

const postHandleGrantAdmin = async (req, res) => {
  if (!req.user) {
    res.status(403).send("Unauthorized");
  }
  if (req.body.password !== process.env.ADMIN_PASSWORD) {
    res.redirect("/account/admin");
    return;
  }
  const user = await User.findById(req.user.id);
  user.roles.push("Admin");
  await user.save();
  res.redirect("/post");
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
