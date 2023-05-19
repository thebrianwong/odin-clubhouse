const express = require("express");
const authenticationController = require("../controllers/authenticationControllers");

const router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

router.get("/sign-up", authenticationController.getSignUpPage);

router.post(
  "/sign-up",
  authenticationController.validateSignUpDetails,
  authenticationController.postAccountCreation
);

module.exports = router;
