const express = require("express");
const authenticationController = require("../controllers/authenticationController");

const router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

router.get("/sign-up", authenticationController.getSignUpPage);

router.post("/sign-up", authenticationController.postHandleSignUp);

module.exports = router;
