const express = require("express");

const router = express.Router();
const auth = require("../middlewares/auth");
const mailController = require("../controllers/mailController");

router.post("/", auth, mailController.sendMail);

router.get("/:task_id/status", auth, mailController.checkStatus);

module.exports = router;