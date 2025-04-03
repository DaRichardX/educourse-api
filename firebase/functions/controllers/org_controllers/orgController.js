const {admin, db} = require("@utils/firebase-admin");


/**
 * Adds a new student to an organization.
 * 
 * **Endpoint:** `POST /orgs/specific/:id/students`
 * 
 * This function adds a student to the `students` collection within `org_data` for the specified organization.
 * 
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * 
 * @property {string} req.params.id - The organization ID (orgId).
 * @property {string} req.body.student_id - The unique student ID.
 * @property {string} req.body.first_name - The student's first name.
 * @property {string} req.body.last_name - The student's last name.
 * @property {string} req.body.primary_email - The student's primary email.
 * 
 * @returns {void} Sends a JSON response indicating success or failure.
 * 
 * - **400 Bad Request:** If required fields are missing.
 * - **409 Conflict:** If the student already exists.
 * - **500 Internal Server Error:** If an unexpected error occurs.
 */
exports.addStudent = async (req, res) => {
  const { id: orgId } = req.params; // Extract org_id from request params
  const { student_id, first_name, last_name, primary_email } = req.body;

  if (!student_id || !first_name || !last_name || !primary_email) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      const studentRef = db.collection("orgs").doc(orgId).collection("org_data").doc("students");
      const studentDoc = await studentRef.get();
      
      if (studentDoc.exists && studentDoc.data()[student_id]) {
          return res.status(409).json({ error: "Student already exists" });
      }

      await studentRef.set(
          {
              [student_id]: {
                  first_name,
                  last_name,
                  primary_email,
              },
          },
          { merge: true }
      );

      return res.status(201).json({ message: "Student added successfully", student_id });
  } catch (error) {
      console.error("Error adding student:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Updates an existing student's details in an organization.
 * 
 * **Endpoint:** `PATCH /orgs/specific/:id/students/:student_id`
 * 
 * This function updates a student's details within `org_data` for the specified organization.
 * 
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * 
 * @property {string} req.params.id - The organization ID (orgId).
 * @property {string} req.params.student_id - The unique student ID.
 * @property {object} req.body - The fields to update (e.g., `{ first_name: "New Name" }`).
 * 
 * @returns {void} Sends a JSON response indicating success or failure.
 * 
 * - **400 Bad Request:** If `student_id` is missing.
 * - **404 Not Found:** If the student does not exist.
 * - **500 Internal Server Error:** If an unexpected error occurs.
 */
exports.updateStudent = async (req, res) => {
  const { id: orgId, student_id } = req.params; // Extract org_id and student_id from request params
  const updates = req.body;

  if (!student_id) {
      return res.status(400).json({ error: "Student ID is required" });
  }

  try {
      const studentRef = db.collection("orgs").doc(orgId).collection("org_data").doc("students");
      const studentDoc = await studentRef.get();
      
      if (!studentDoc.exists || !studentDoc.data()[student_id]) {
          return res.status(404).json({ error: "Student not found" });
      }

      await studentRef.set(
          {
              [student_id]: updates,
          },
          { merge: true }
      );

      return res.status(200).json({ message: "Student updated successfully", student_id });
  } catch (error) {
      console.error("Error updating student:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Adds a new room to an organization.
 * 
 * **Endpoint:** `POST /orgs/specific/:id/rooms`
 * 
 * This function creates a new room in the `rooms` collection within `org_data` for the specified organization.
 * 
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * 
 * @property {string} req.params.id - The organization ID (orgId).
 * @property {string} req.body.room_id - The unique room ID.
 * @property {string} req.body.teacher_name - The name of the teacher responsible for the room.
 * @property {number} req.body.capacity_presenters - The maximum number of presenters allowed in the room.
 * @property {number} req.body.capacity_viewers - The maximum number of viewers allowed in the room.
 * 
 * @returns {void} Sends a JSON response indicating success or failure.
 * 
 * - **400 Bad Request:** If required fields are missing.
 * - **409 Conflict:** If the room already exists.
 * - **500 Internal Server Error:** If an unexpected error occurs.
 */
exports.addRoom = async (req, res) => {
  const { id: orgId } = req.params;
  const { room_id, teacher_name, capacity_presenters, capacity_viewers } = req.body;

  if (!room_id || !teacher_name || capacity_presenters == null || capacity_viewers == null) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      const roomRef = db.collection("orgs").doc(orgId).collection("org_data").doc("rooms");
      const roomDoc = await roomRef.get();

      if (roomDoc.exists && roomDoc.data()[room_id]) {
          return res.status(409).json({ error: "Room already exists" });
      }

      await roomRef.set(
          {
              [room_id]: {
                  teacher_name,
                  capacity_presenters,
                  capacity_viewers,
              },
          },
          { merge: true }
      );

      return res.status(201).json({ message: "Room added successfully", room_id });
  } catch (error) {
      console.error("Error adding room:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

/**
* Updates an existing room's details in an organization.
* 
* **Endpoint:** `PATCH /orgs/specific/:id/rooms/:room_id`
* 
* This function updates a room's details within `org_data` for the specified organization.
* 
* @param {import("express").Request} req - The Express request object.
* @param {import("express").Response} res - The Express response object.
* 
* @property {string} req.params.id - The organization ID (orgId).
* @property {string} req.params.room_id - The unique room ID.
* @property {object} req.body - The fields to update (e.g., `{ teacher_name: "New Teacher" }`).
* 
* @returns {void} Sends a JSON response indicating success or failure.
* 
* - **400 Bad Request:** If `room_id` is missing.
* - **404 Not Found:** If the room does not exist.
* - **500 Internal Server Error:** If an unexpected error occurs.
*/
exports.updateRoom = async (req, res) => {
  const { id: orgId, room_id } = req.params;
  const updates = req.body;

  if (!room_id) {
      return res.status(400).json({ error: "Room ID is required" });
  }

  try {
      const roomRef = db.collection("orgs").doc(orgId).collection("org_data").doc("rooms");
      const roomDoc = await roomRef.get();

      if (!roomDoc.exists || !roomDoc.data()[room_id]) {
          return res.status(404).json({ error: "Room not found" });
      }

      await roomRef.set(
          {
              [room_id]: updates,
          },
          { merge: true }
      );

      return res.status(200).json({ message: "Room updated successfully", room_id });
  } catch (error) {
      console.error("Error updating room:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

