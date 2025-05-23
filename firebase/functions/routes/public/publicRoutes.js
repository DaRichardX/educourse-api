// api/public

const express = require("express");

const router = express.Router();
const capstoneController = require("@controllers/org_controllers/capstoneController");

// Route to org public routes, to be implemented.

// Currently only /public route
router.post("/org/specific/:id/capstone/signups", capstoneController.postSignup);
router.get("/org/specific/:id/capstone/selections", capstoneController.getSelections);


module.exports = router;
