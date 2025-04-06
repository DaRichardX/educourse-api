require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mailRoutes = require("./routes/mailRoutes");
const auth = require("./middlewares/auth");
const MemoryQueue = require('./utils/queues/memoryQueue'); // In-memory queue implementation

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

// Start server
const PORT = process.env.PORT || 10001;
app.listen(PORT, () => {
  console.log(`[Service] Mailer service running on port ${PORT}`);
});