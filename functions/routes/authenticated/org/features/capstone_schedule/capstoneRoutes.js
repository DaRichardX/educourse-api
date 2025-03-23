// /api/org/specific/:id/capstone

const express = require("express");

const router = express.Router({ mergeParams: true });
const checkPermissions = require("../../../../../middleware/checkPermissions");


// todo: implement module alias
const capstoneController = require("../../../../../controllers/org_controllers/capstoneController");

// Routes

// add signup
router.post("/signups", capstoneController.postSignup);

module.exports = router;
