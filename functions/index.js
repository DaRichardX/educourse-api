// Setup Express.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");


const app = express();

// Global middleware
app.use(cors()); // cors
app.use(express.json()); // json middleware

// Import middlewares
const authenticate = require("./middleware/authenticate");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const orgRoutes = require("./routes/org_routes/orgRoutes");

// public routes
app.use("/auth", authRoutes);

// protected routes
app.use("/user", authenticate, userRoutes);
app.use("/org", authenticate, orgRoutes);

// https://us-central1-educourse-e0c66.cloudfunctions.net/
// Export the Express app to Firebase Functions
exports.api = functions.https.onRequest(app);
