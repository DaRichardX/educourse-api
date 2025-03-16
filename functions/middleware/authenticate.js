const {admin} = require("../utils/firebase-admin");

const {db} = require("../utils/firebase-admin");

// Verify valid token & attach user data
const authenticate = async (req, res, next) => {
  let token;

  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({message: "Unauthorized: No token provided"});
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to request

    // Attach additional user info from Firestore
    const userData = await fetchUserData(decodedToken.uid);
    req.user.data = userData;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(403).json({message: "Forbidden: Invalid or expired token"});
  }
};

// grab user data from Firestore
const fetchUserData = async (uid) => {
  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  return userDoc.data();
};

module.exports = authenticate;
