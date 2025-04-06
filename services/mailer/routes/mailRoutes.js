const express = require("express");

const router = express.Router();
const auth = require("../middlewares/auth");
const mailController = require("../controllers/mailController");

module.exports = (queue) => {
    // Queue mail job
    router.post('/', auth, (req, res) => mailController.queueMail(queue)(req, res));
  
    // Check status of a queued task
    router.get('/:task_id/status', auth, (req, res) => mailController.checkStatus()(req, res));
  
    return router;
};