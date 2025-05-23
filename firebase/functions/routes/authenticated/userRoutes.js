// api/user

const express = require("express");

const router = express.Router();
const checkPermissions = require("@middlewares/checkPermissions");
const userController = require("@controllers/userController");

// Route to register a new user
router.put("/:id", checkPermissions(""), userController.updateUserInfo);

module.exports = router;
