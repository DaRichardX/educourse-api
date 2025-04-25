require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mailRoutes = require("./routes/mailRoutes");
const auth = require("./middlewares/auth");
const MemoryQueue = require('./utils/queues/memoryQueue'); // In-memory queue implementation
const runMailWorker = require('./runners/mailWorkerRunner');

const app = express();

app.use(cors());
app.use(express.json());

// Create a new in-memory queue instance
// TODO: swap to redis or another persistant queue
const memoryQueue = new MemoryQueue();

// Authenticate JWT
app.use(auth);

// Mount route at /api/mailer
app.use("/", mailRoutes(memoryQueue));

// Worker Configuration
const MAIL_WORKER_INTERVAL = 20000; // 60 seconds
const MAIL_LIMIT_PER_BATCH = 20; // 20 mail per minute

// Start the mail worker
runMailWorker(memoryQueue, MAIL_WORKER_INTERVAL, MAIL_LIMIT_PER_BATCH);

// Start server
const PORT = process.env.PORT || 10001;
app.listen(PORT, () => {
  console.log(`[Service] Mailer service running on port ${PORT}`);
});