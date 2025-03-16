const {admin} = require("../utils/firebase-admin");

const msg = {
  message: "success in userController",
  route: "",
};

// **Signup: Register a new user**
exports.updateUserInfo = async (req, res) => {
  msg.route = "updateInfo";
  res.status(200).json(msg);
};
