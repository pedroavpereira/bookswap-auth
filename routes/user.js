const { Router } = require("express");

const userController = require("../controllers/users");
const { tokenAuthenticator } = require("../middleware/tokenAuthenticator");

const router = Router();

router.post("/login", userController.login);

router.post("/signup", userController.signup);

router.use(tokenAuthenticator);

router.get("/validate-token", userController.verifyToken);

router.get("/restrict-to", userController.restrictTo);

module.exports = router;
