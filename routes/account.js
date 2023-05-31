const express = require("express");
const accountController = require("../controllers/accountController");

const router = express.Router();

router.get("/sign-up", accountController.getSignUpPage);

router.post("/sign-up", accountController.postHandleSignUp);

router.get("/log-in", accountController.getLogInPage);

router.post("/log-in", accountController.postLogIn);

router.get("/member", accountController.getMemberPage);

router.post("/member", accountController.postHandleMembership);

router.get("/admin", accountController.getAdminPage);

router.post("/admin", accountController.postHandleGrantAdmin);

router.post("/log-out", accountController.postLogOut);

module.exports = router;
