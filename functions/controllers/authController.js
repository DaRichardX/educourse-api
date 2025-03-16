const {admin} = require("../utils/firebase-admin");

const msg = {
  message: "success",
  route: "",
};

// **Signup: Register a new user**
exports.signup = async (req, res) => {
  msg.route = "signup";
  res.status(200).json(msg);
};

// **Reset Password: Send a reset link to user's email**
exports.resetPassword = async (req, res) => {
  msg.route = "pw";
  res.status(200).json(msg);
};
