const { body, validationResult } = require("express-validator");
const passport = require("passport");
const { hashPassword } = require("../utils/authenticationUtils");
const User = require("../models/user.model");

const getSignUpPage = (req, res) => {
  if (req.user) {
    res.redirect("/post");
    return;
  }
  res.render("auth/sign-up");
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
    .custom(async (value) => {
      const usernameExists = await User.findOne({ username: value }).exec();
      if (usernameExists === null) {
        return Promise.resolve();
      }
      return Promise.reject();
    })
    .withMessage("Username is already taken.")
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
      const { firstName, lastName, username } = req.body;
      const errors = result.errors.reduce(
        (totalErr, currentErr) => ({
          ...totalErr,
          [currentErr.path]: currentErr.msg,
        }),
        {}
      );
      res.render("auth/sign-up", { firstName, lastName, username, errors });
    } else {
      next();
    }
  },
];

const createAccount = async (req, res, next) => {
  try {
    const { firstName, lastName, username, password } = req.body;
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
    err.message = "Something seems to have gone wrong. Please try again later.";
    next(err);
  }
};

const postHandleSignUp = [validateSignUpDetails, createAccount];

const getLogInPage = (req, res) => {
  if (req.user) {
    res.redirect("/post");
    return;
  }
  let error;
  if (req.session.messages) {
    error = req.session.messages;
  }
  req.session.messages = undefined;
  res.render("auth/log-in", { error });
};

const postLogIn = passport.authenticate("local", {
  successRedirect: "/post",
  failureRedirect: "/account/log-in",
  failureMessage: "Invalid credentials. Try again.",
});

const getMemberPage = (req, res, next) => {
  if (!req.user) {
    const err = new Error("Unauthorized");
    err.status = 401;
    next(err);
    return;
  }
  res.render("roles/member", { user: req.user });
};

const postHandleMembership = async (req, res, next) => {
  try {
    if (!req.user) {
      const err = new Error("Bad Request");
      err.status = 400;
      next(err);
      return;
    }
    if (req.body.password !== process.env.MEMBER_PASSWORD) {
      res.render("roles/member", { error: "Wrong, try again!" });
      return;
    }
    const user = await User.findById(req.user.id).exec();
    user.roles.push("Member");
    await user.save();
    console.log(`User ID ${req.user.id} is now a Member.`);
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
    const err = new Error("Unauthorized");
    err.status = 401;
    next(err);
    return;
  }
  res.render("roles/admin", { user: req.user });
};

const postHandleGrantAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      const err = new Error("Bad Request");
      err.status = 400;
      next(err);
      return;
    }
    if (req.body.password !== process.env.ADMIN_PASSWORD) {
      res.render("roles/admin", { error: "Wrong, try again!" });
      return;
    }
    const user = await User.findById(req.user.id).exec();
    user.roles.push("Admin");
    await user.save();
    console.log(`User ID ${req.user.id} is now an Admin.`);
    res.redirect("/post");
  } catch (err) {
    console.error(
      "There was an issue with database operations while granting Admin status."
    );
    err.status = 500;
    next(err);
  }
};

const postLogOut = (req, res, next) => {
  try {
    req.logout(() => {
      res.redirect("/account/log-in");
    });
  } catch (err) {
    console.error(
      `There was an error when user ID ${req.user.id} tried to log out.`
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
  postLogOut,
};
