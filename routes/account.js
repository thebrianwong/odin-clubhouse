const express = require("express");
const accountController = require("../controllers/accountController");

const router = express.Router();
router.use((req, res, next) => {
  console.log(req.user);
  next();
});
/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

router.get("/sign-up", accountController.getSignUpPage);

router.post("/sign-up", accountController.postHandleSignUp);

router.get("/log-in", accountController.getLogInPage);

router.post("/log-in", accountController.postLogIn);

module.exports = router;
