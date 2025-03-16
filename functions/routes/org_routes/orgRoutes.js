// /api/org

const express = require("express");

const router = express.Router();
const {authorize} = require("../../middleware/authorize");
const {AUTH_TYPES} = require("../../middleware/authorize");


const orgController = require("../../controllers/org_controllers/orgController");

// public routes for inter-organization
router.get("/metadata", orgController.metadata);

// protected routes need same organization
router.use("/:id", authorize(AUTH_TYPES.SAME_ORG), require("./authorizedRoutes"));

module.exports = router;
