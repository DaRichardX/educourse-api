const admin = require("firebase-admin");

// Initialize the Firebase Admin SDK only once.
if (!admin.apps.length) {
  admin.initializeApp();
} else {
  admin.app(); // If already initialized, just use the existing app instance
}

const dbRefs = require("./db-references");
const db = admin.firestore();

// Export the admin instance to be used elsewhere
module.exports = {admin, db, ...dbRefs};
