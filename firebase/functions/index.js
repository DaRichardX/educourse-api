// module-alias
require('module-alias/register');

// Setup Express.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");


const app = express();

// Global middleware
app.use(cors()); // cors
app.use(express.json()); // json middleware

// Import middlewares
const authenticate = require('@middlewares/authenticate');

// Import routes
const authRoutes = require("@routes/public/authRoutes");
const publicRoutes = require("@routes/public/publicRoutes");
const userRoutes = require("@routes/authenticated/userRoutes");
const orgRoutes = require("@routes/authenticated/org/orgRoutes");

// public routes
app.use("/auth", authRoutes);
app.use("/public", publicRoutes);


// protected routes
app.use("/user", authenticate, userRoutes);
app.use("/org", authenticate, orgRoutes);

// https://us-central1-educourse-e0c66.cloudfunctions.net/
// https://docs.google.com/document/d/1JiTUvRFcYI8ijPmhIrKkklOQCN_oi8qEnmz9gySCXSE
// Export the Express app to Firebase Functions
exports.api = functions.https.onRequest(app);
