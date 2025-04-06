require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mailRoutes = require("./routes/mailRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Authenticate JWT
app.use(auth);

// Mount route at /api/mailer
app.use("/api/mailer", mailRoutes);

// Start server
const PORT = process.env.PORT || 10001;
app.listen(PORT, () => {
  console.log(`[Service] Mailer service running on port ${PORT}`);
});