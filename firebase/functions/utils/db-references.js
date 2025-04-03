const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * Returns a reference to the organization's capstone metadata document.
 * @param {string} orgId - The organization ID.
 * @returns {FirebaseFirestore.DocumentReference} Firestore document reference.
 */
const getCapstoneMetadataRef = (orgId) => {
  return db.collection("orgs").doc(orgId).collection("capstone_schedule").doc("metadata");
};

/**
 * Returns a reference to the organization's capstone signups document.
 * @param {string} orgId - The organization ID.
 * @returns {FirebaseFirestore.DocumentReference} Firestore document reference.
 */
const getSignupRef = (orgId) => {
  return db.collection("orgs").doc(orgId).collection("capstone_schedule").doc("signups");
};

/**
 * Returns a reference to the organization's capstone signup_links document.
 * @param {string} orgId - The organization ID.
 * @returns {FirebaseFirestore.DocumentReference} Firestore document reference.
 */
const getSignupLinksRef = (orgId) => {
  return db.collection("orgs").doc(orgId).collection("capstone_schedule").doc("signup_links");
};

// Export Firestore reference functions
module.exports = {
  getCapstoneMetadataRef,
  getSignupRef,
  getSignupLinksRef
};
