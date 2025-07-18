// BE_HNOSS/controllers/user.controller.js
const admin = require("../firebase");

exports.getAllUsers = async (req, res) => {
  try {
    const listUsers = await admin.auth().listUsers();
    res.json(listUsers.users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
