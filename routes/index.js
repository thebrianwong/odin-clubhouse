const express = require("express");
const authenticationController = require("../controllers/authenticationController");

const router = express.Router();
router.use((req, res, next) => {
  console.log(req.user);
  next();
});
/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

router.get("/sign-up", authenticationController.getSignUpPage);

router.post("/sign-up", authenticationController.postHandleSignUp);

router.get("/log-in", authenticationController.getLogInPage);

router.post("/log-in", authenticationController.postLogIn);

module.exports = router;
