// /api/org/:id/capstone

const express = require("express");

const router = express.Router({ mergeParams: true });
const checkPermissions = require("../../middleware/checkPermissions");

const capstoneController = require("../../controllers/org_controllers/capstoneController");

// Routes

// add signup
router.post("/signups", capstoneController.addSignup);

module.exports = router;
