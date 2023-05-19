const { body, validationResult } = require("express-validator");

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

const postAccountCreation = (req, res, next) => {
  const result = validationResult(req);
  if (result.errors.length) {
    res.status(401).send("errors");
  }
  console.log(req.body);
  next();
};

module.exports = {
  getSignUpPage,
  validateSignUpDetails,
  postAccountCreation,
};
