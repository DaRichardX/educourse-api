const {admin} = require("../../utils/firebase-admin");

const msg = {
  message: "success",
  route: "",
};

// **Signup: Register a new user**
exports.metadata = async (req, res) => {
  msg.route = "getting metadata";
  res.status(200).json(msg);
};
