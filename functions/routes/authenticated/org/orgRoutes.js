// /api/org

const express = require("express");

const router = express.Router();
const {authorize, AUTH_TYPES} = require("@middlewares/authorize");


const orgController = require("@controllers/org_controllers/orgController");

// protected routes need same organization
// /api/org/specific/example-org-id-1
router.use("/specific/:id", authorize(AUTH_TYPES.SAME_ORG), require("./specificRoutes"));

// public routes for inter-organization
// router.get("/", orgController.metadata);



module.exports = router;
