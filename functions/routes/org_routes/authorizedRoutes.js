// /api/org/:id

const express = require("express");

const router = express.Router({ mergeParams: true });
const capstoneRoutes = require("./capstoneRoutes");


// Routes

router.use("/capstone", capstoneRoutes);


module.exports = router;
