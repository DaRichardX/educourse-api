const {admin} = require("../../utils/firebase-admin");

const msg = {
  message: "",
  route: "",
  req_params: {},
};

exports.addSignup = async (req, res) => {
  msg.route = "add capstone signup";
  msg.message = `added signup to ${req.params.id}`;
  res.status(200).json(msg);
};
