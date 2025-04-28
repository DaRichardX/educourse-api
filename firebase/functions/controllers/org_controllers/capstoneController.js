const {admin, db} = require("@utils/firebase-admin");
const {generateSecureUUID} = require("@utils/crypto");

// doc references
const {getCapstoneMetadataRef} = require("@utils/firebase-admin");
const {getSignupLinksRef} = require("@utils/firebase-admin");
const {getSignupRef} = require("@utils/firebase-admin");

const EXPIRY_DAYS = 40; // Define link expiry period in days afters creation


/**
 * Updates the capstone registration status.
 * 
 * **Endpoint:** `PATCH /api/specific/orgs/:id/capstone/status`
 * 
 * This function updates the `isSignupClosed` flag in the `metadata` document of the `capstone_schedule` collection.
 * 
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * 
 * @property {string} req.params.id - The organization ID (orgId).
 * @property {boolean} req.body.isSignupClosed - The new status for capstone signup (true = closed, false = open).
 * 
 * @returns {void} Sends a JSON response indicating success or failure.
 * 
 * - **400 Bad Request:** If the `isSignupClosed` parameter is missing.
 * - **500 Internal Server Error:** If an unexpected error occurs.
 */
exports.updateStatus = async (req, res) => {
  try {
    const { isSignupClosed } = req.body;
    const orgId = req.params.id;

    if (typeof isSignupClosed !== "boolean") {
      return res.status(400).json({ error: "Missing or invalid isSignupClosed flag" });
    }

    // Reference to the metadata document
    const metadataRef = getCapstoneMetadataRef(orgId);

    // Update the isSignupClosed flag
    await metadataRef.update({ isSignupClosed });
    res.status(200).json({ message: `Capstone signup status changed to ${isSignupClosed ? "closed" : "open"}`});
  } catch (error) {
    console.error("Error updating signup status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Adds a new presenter to an organization.
 * 
 * **Endpoint:** `POST /org/specific/:org_id/presentors`
 * 
 * This function creates a new presenter in the `presentors` collection within `capstone_schedule` for the specified organization.
 * 
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * 
 * @property {string} req.params.org_id - The organization ID (orgId).
 * @property {string} req.body.presenter_id - The unique presenter ID.
 * @property {string} req.body.topic - The presenter's topic.
 * @property {string} req.body.room_id - The ID of the room the presenter is assigned to.
 * 
 * @returns {void} Sends a JSON response indicating success or failure.
 * 
 * - **400 Bad Request:** If required fields are missing.
 * - **409 Conflict:** If the presenter already exists.
 * - **500 Internal Server Error:** If an unexpected error occurs.
 */
exports.addPresenter = async (req, res) => {
  const { org_id } = req.params;
  const { presenter_id, topic, room_id } = req.body;

  if (!presenter_id || !topic || !room_id) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      const presenterRef = db.collection("orgs").doc(org_id).collection("capstone_schedule").doc("presentors");
      const presenterDoc = await presenterRef.get();

      if (presenterDoc.exists && presenterDoc.data()[presenter_id]) {
          return res.status(409).json({ error: "Presenter already exists" });
      }

      await presenterRef.set(
          {
              [presenter_id]: {
                  topic,
                  room_id,
              },
          },
          { merge: true }
      );

      return res.status(201).json({ message: "Presenter added successfully", presenter_id });
  } catch (error) {
      console.error("Error adding presenter:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Updates an existing presenter's details in an organization.
 * 
 * **Endpoint:** `PATCH /org/specific/:org_id/presentors/:presenter_id`
 * 
 * This function updates a presenter's details within `capstone_schedule` for the specified organization.
 * 
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * 
 * @property {string} req.params.org_id - The organization ID (orgId).
 * @property {string} req.params.presenter_id - The unique presenter ID.
 * @property {object} req.body - The fields to update (e.g., `{ topic: "New Topic" }`).
 * 
 * @returns {void} Sends a JSON response indicating success or failure.
 * 
 * - **400 Bad Request:** If `presenter_id` is missing.
 * - **404 Not Found:** If the presenter does not exist.
 * - **500 Internal Server Error:** If an unexpected error occurs.
 */
exports.updatePresenter = async (req, res) => {
  const { org_id, presenter_id } = req.params;
  const updates = req.body;

  if (!presenter_id) {
      return res.status(400).json({ error: "Presenter ID is required" });
  }

  try {
      const presenterRef = db.collection("orgs").doc(org_id).collection("capstone_schedule").doc("presentors");
      const presenterDoc = await presenterRef.get();

      if (!presenterDoc.exists || !presenterDoc.data()[presenter_id]) {
          return res.status(404).json({ error: "Presenter not found" });
      }

      await presenterRef.set(
          {
              [presenter_id]: updates,
          },
          { merge: true }
      );

      return res.status(200).json({ message: "Presenter updated successfully", presenter_id });
  } catch (error) {
      console.error("Error updating presenter:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

// ---------- Public Routes ---------

/**
 * Handles signup for capstone projects.
 * 
 * **Endpoint:** `POST /api/public/org/specific/:id/capstone/signups?id={signupId}`
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

    // Ensure the signup is still open
    const signupMetadata = getCapstoneMetadataRef(orgId);
    const signupMetadataDoc = await signupMetadata.get();
    if (!signupMetadataDoc.exists) {
      return res.status(404).json({ error: `Document 'metadata' for 'capstone_schedule' not found for org '${orgId}'` });
    }
    if (signupMetadataDoc.data().isSignupClosed){
      return res.status(403).json({ error: `Capstone signup is closed for org '${orgId}'` });
    }

    // Reference to the signup link
    const signupLinkRef = getSignupLinksRef(orgId);

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
    const signupRef = getSignupRef(orgId);

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


// TODO: clean up code
const PRESENTOR_PATH = (orgId) => db.collection("orgs").doc(orgId).collection("capstone_schedule").doc("presentors");
const STUDENT_PATH = (orgId) => db.collection("orgs").doc(orgId).collection("org_data").doc("students");
/**
 * Retrieves available room selections and signup details for a given signup link.
 * 
 * **Endpoint:** `GET /org/specific/:id/selections?id=:signupId`
 * 
 * This function fetches the signup details associated with a `signupId`, checks if the signup link is still valid,
 * and returns available rooms along with their occupancy data.
 * 
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * 
 * @property {string} req.params.id - The organization ID (orgId).
 * @property {string} req.query.id - The unique signup ID.
 * 
 * @returns {void} Sends a JSON response containing signup information and room options.
 * 
 * @example
 * // Example request URL:
 * GET /org/specific/example/capstone/selections?id=4dd6c4dc-9921-410a-a222-e82c1857c0ad
 * 
 * @example
 * // Example successful response (200 OK)
 * {
 *   "student_id": "2114489",
 *   "selected": true,
 *   "available_rooms": [
 *     {
 *       "roomId": "1A2",
 *       "teacher": "Ms. Au",
 *       "capacityPresenters": 5,
 *       "capacityViewers": 25,
 *       "currentSignups": 2,
 *       "availableSpots": 23
 *     },
 *     {
 *       "roomId": "1A3",
 *       "teacher": "Mr. Smith",
 *       "capacityPresenters": 4,
 *       "capacityViewers": 20,
 *       "currentSignups": 4,
 *       "availableSpots": 16
 *     }
 *   ]
 * }
 * 
 * @throws {400} If the `signupId` query parameter is missing.
 * @throws {403} If the signup link has expired.
 * @throws {404} If the signup link or organization data is not found.
 * @throws {500} If an internal server error occurs.
 */
exports.getSelections = async (req, res) => {
  try {
    const orgId = req.params.id;
    const signupId = req.query.id;

    if (!signupId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Reference to the signup link
    const signupLinkRef = getSignupLinksRef(orgId);
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

    // Fetch organization room data
    const roomRef = db.collection("orgs").doc(orgId).collection("org_data").doc("rooms");
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return res.status(404).json({ error: `Room data not found for org '${orgId}'` });
    }

    const rooms = roomDoc.data() || {};

    // Fetch presenters data
    const presenterRef = PRESENTOR_PATH(orgId);
    const presenterDoc = await presenterRef.get();
    const presentersData = presenterDoc.exists ? presenterDoc.data() : {};

    // Fetch student details data
    const studentRef = STUDENT_PATH(orgId);
    const studentDoc = await studentRef.get();
    const studentData = studentDoc.exists ? studentDoc.data() : {};

    // Lookup for the owner of the signup link
    const ownerDetails = studentData[storedStudent] || { first_name: "", last_name: "" };

    // Format room data with available spots and presenters
    const availableRooms = Object.entries(rooms).map(([roomId, roomDetails]) => {
      // Find presenters assigned to this room
      const roomPresenters = Object.entries(presentersData)
        .filter(([studentId, presenterInfo]) => presenterInfo.room_id === roomId)
        .map(([studentId, presenterInfo]) => {
          const studentInfo = studentData[studentId] || { first_name: "", last_name: "" };
          return {
            topic: presenterInfo.topic,
            name: `${studentInfo.first_name} ${studentInfo.last_name}`.trim()
          };
        });

      return {
        roomId,
        teacher: roomDetails.teacher_name,
        capacityPresenters: parseInt(roomDetails.capacity_presenters, 10),
        capacityViewers: parseInt(roomDetails.capacity_viewers, 10),
        currentSignups: roomDetails.current_signups || 0,
        availableSpots: Math.max(0, roomDetails.capacity_viewers - (roomDetails.current_signups || 0)),
        presenters: roomPresenters
      };
    });

    // Return signup info, link owner's name, and room availability
    res.status(200).json({
      student_id: storedStudent,
      selected,
      first_name: ownerDetails.first_name,
      last_name: ownerDetails.last_name,
      available_rooms: availableRooms,
    });
  } catch (error) {
    console.error("Error providing signup selection data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



/**
 * Generates a map of signup links for students with expiry dates.
 *
 * @param {number[]} students - An array of student IDs.
 * @returns {Object} A map where each key is a UUID and each value is an object containing:
 *                   - `expiry`: an object with Firestore-compatible timestamp (`_seconds`, `_nanoseconds`).
 *                   - `student`: the student ID as a string.
 *                   - `selected`: a boolean indicating if the student has been selected (default: false).
 *
 * @example
 * const students = [2114489, 221592, 224567];
 * const links = generateLinks(students);
 * console.log(links);
 */
const generateLinks = (students) => {
  const now = new Date();

  // Calculate expiry timestamp
  const calculateExpiry = (days) => {
    const expiryDate = new Date(now);
    expiryDate.setDate(now.getDate() + days); // Add the days to current date
    return {
      "_seconds": Math.floor(expiryDate.getTime() / 1000), // Convert to seconds
      "_nanoseconds": (expiryDate.getMilliseconds() * 1000000) // Convert to nanoseconds
    };
  };

  // Map student IDs to signup links
  const signupLinksMap = {};

  students.forEach(student => {
    const uuid = generateSecureUUID();
    signupLinksMap[uuid] = {
      "expiry": calculateExpiry(expiryDays),
      "student": student.toString(),
      "selected": false
    };
  });

  return signupLinksMap;
};

