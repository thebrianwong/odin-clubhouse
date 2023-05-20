const { body, validationResult } = require("express-validator");
const { hashPassword } = require("../utils/authenticationUtils");
const User = require("../models/user");

const getSignUpPage = (req, res) => {
  res.render("sign-up");
};

const validateSignUpDetails = [
  body("firstName")
    .notEmpty()
    .withMessage("First name must not be empty.")
    .isString(),
  body("lastName")
    .notEmpty()
    .withMessage("Last name must not be empty.")
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
];

const postAccountCreation = async (req, res, next) => {
  const result = validationResult(req);
  if (result.errors.length) {
    // Redirect to sign up page with form filled with entered details
    res.status(401).send("errors");
  }
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
  console.log(`Successfully created and saved User ID ${newUserDocument._id}`);
  // redirect to login page
  next();
};

module.exports = {
  getSignUpPage,
  validateSignUpDetails,
  postAccountCreation,
};
