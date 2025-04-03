// /api/org/specific/:id/capstone

const express = require("express");

const router = express.Router({ mergeParams: true });
const {authorize, AUTH_TYPES} = require("@middlewares/authorize")
const checkPermissions = require("@middlewares/checkPermissions");

const capstoneController = require("@controllers/org_controllers/capstoneController");

// Routes

/* change status of capstone signup
removed middleware: "authorize(AUTH_TYPES.ORG_ADMIN)" due to no other authenticated org roles
---> to be implemented in the future once org roles increases. */
router.patch("/status", capstoneController.updateStatus);

router.post("/presentors", capstoneController.addPresenter);
router.patch("/presentors/:presenter_id", capstoneController.updatePresenter);



module.exports = router;
