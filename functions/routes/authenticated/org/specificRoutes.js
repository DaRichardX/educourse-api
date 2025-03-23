// /api/org/specific/:id

const express = require("express");

const router = express.Router({ mergeParams: true });
const capstoneRoutes = require("./features/capstone_schedule/capstoneRoutes");

// Routes

router.use("/capstone", capstoneRoutes);


module.exports = router;
