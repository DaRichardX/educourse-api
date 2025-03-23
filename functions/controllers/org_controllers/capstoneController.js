const {admin} = require("../../utils/firebase-admin");
const db = admin.firestore();


// POST /api/org/:id/capstone/status
// Change status of capstone registeration (ex. open/close reg)
// args: json capstone status
exports.postStatus = async (req, res) => {

};


exports.postStatus = async (req, res) => {

};

// ---------- public routes ---------


/**
 * Handles signup for capstone projects.
 * 
 * **Endpoint:** `POST /api/public/org/:id/capstone/signups?id={signupId}`
 * 
 * This function verifies the signup link, ensures it is valid and not expired, and associates the student with a room.
 * 
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * 
 * @property {string} req.params.id - The organization ID (orgId).
 * @property {string} req.query.id - The signup link ID (signupId).
 * @property {string} req.body.student - The student ID attempting to sign up.
 * @property {string} req.body.room_id - The room ID the student is signing up for.
 * 
 * @returns {void} Sends a JSON response indicating success or failure.
 * 
 * - **400 Bad Request:** If required parameters are missing.
 * - **403 Forbidden:** If the signup link is expired, already used, or belongs to another student.
 * - **404 Not Found:** If the signup link does not exist.
 * - **500 Internal Server Error:** If an unexpected error occurs.
 */
exports.postSignup = async (req, res) => {
  try {
    const { student, room_id } = req.body;
    const orgId = req.params.id;
    const signupId = req.query.id;

    if (!student || !room_id || !signupId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Reference to the signup link
    const signupLinkRef = db.collection("orgs").doc(orgId)
      .collection("capstone_schedule").doc("signup_links");

    // Fetch the signup link data
    const signupLinkDoc = await signupLinkRef.get();
    if (!signupLinkDoc.exists) {
      return res.status(404).json({ error: `Document 'signup_links' not found for org '${orgId}'` });
    }

    const signupLinks = signupLinkDoc.data();
    const signupData = signupLinks[signupId];

    if (!signupData) {
      return res.status(404).json({ error: "Invalid signup ID" });
    }

    const { student: storedStudent, expiry, selected } = signupData;

    // Check if the signup link is expired
    if (new Date() > expiry.toDate()) {
      return res.status(403).json({ error: "Signup link expired" });
    }

    // Check if the signup link is already used
    if (selected) {
      return res.status(403).json({ error: "Signup link already used, student selected room already" });
    }

    // Ensure student ID matches
    if (student !== storedStudent) {
      return res.status(403).json({ error: "Unauthorized signup attempt" });
    }

    // Reference to the signups document
    const signupRef = db.collection("orgs").doc(orgId)
      .collection("capstone_schedule").doc("signups");

    // Update Firestore with student#: room_id
    await signupRef.set({ [student]: room_id }, { merge: true });

    // Mark the signup link as used
    await signupLinkRef.update({
      [`${signupId}.selected`]: true
    });

    res.status(200).json({ message: "Signup recorded successfully" });
  } catch (error) {
    console.error("Error adding signup:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
