const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");

// Route to register a new user
router.post("/signup", authController.signup);

// Route to reset the password (if needed)
router.post("/reset-password", authController.resetPassword);

module.exports = router;
