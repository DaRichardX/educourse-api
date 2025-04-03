// /api/org/specific/:id

const express = require("express");

const router = express.Router({ mergeParams: true });
const capstoneRoutes = require("./features/capstone_schedule/capstoneRoutes");
const orgController = require("@controllers/org_controllers/orgController");

// Routes

router.use("/capstone", capstoneRoutes);

router.post("/students", orgController.addStudent); // add student
router.patch("/students/:student_id", orgController.updateStudent); // edit student

router.post("/rooms", orgController.addRoom); // add room
router.patch("/rooms/:room_id", orgController.updateRoom); // edit room


module.exports = router;
