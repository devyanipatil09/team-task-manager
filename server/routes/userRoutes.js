const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/role");

// @route   GET api/users
// @desc    Get all users (mainly members for assignment)
// @access  Private (Admin only)
router.get("/", [auth, adminOnly], async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
