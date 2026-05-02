const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Project = require("../models/Project");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/role");

// @route   POST api/projects
// @desc    Create a project
// @access  Private (Admin only)
router.post(
  "/",
  [auth, adminOnly],
  [body("name", "Name is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, members } = req.body;

      const newProject = new Project({
        name,
        description,
        createdBy: req.user.id,
        members: members || [],
      });

      const project = await newProject.save();
      
      const populatedProject = await Project.findById(project._id).populate('members', 'name email role');
      res.json(populatedProject);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/projects
// @desc    Get all projects (Admins see all, Members see projects they are in)
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    let projects;
    if (req.user.role === "admin") {
      projects = await Project.find()
        .populate("members", "name email role")
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ members: req.user.id })
        .populate("members", "name email role")
        .sort({ createdAt: -1 });
    }
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/projects/:id/members
// @desc    Update project members
// @access  Private (Admin only)
router.put("/:id/members", [auth, adminOnly], async (req, res) => {
  try {
    const { members } = req.body; // Expecting an array of user IDs
    
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    // Check if user owns the project
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    project.members = members;
    await project.save();
    
    const updatedProject = await Project.findById(req.params.id).populate("members", "name email role");

    res.json(updatedProject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
