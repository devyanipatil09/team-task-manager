const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Task = require("../models/Task");
const Project = require("../models/Project");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/role");

// @route   POST api/tasks
// @desc    Create a task
// @access  Private (Admin only)
router.post(
  "/",
  [auth, adminOnly],
  [
    body("title", "Title is required").not().isEmpty(),
    body("project", "Project ID is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, project, assignedTo, dueDate } = req.body;

      // Verify project exists and belongs to admin
      const proj = await Project.findById(project);
      if (!proj) return res.status(404).json({ msg: "Project not found" });
      if (proj.createdBy.toString() !== req.user.id) {
        return res.status(401).json({ msg: "Not authorized to add task to this project" });
      }

      const newTask = new Task({
        title,
        description,
        project,
        assignedTo,
        dueDate,
        createdBy: req.user.id,
      });

      const task = await newTask.save();
      const populatedTask = await Task.findById(task._id).populate("assignedTo", "name email").populate("project", "name");
      
      res.json(populatedTask);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/tasks
// @desc    Get all tasks for user (either created by or assigned to, or part of projects they are in)
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === "admin") {
      tasks = await Task.find({ createdBy: req.user.id })
        .populate("assignedTo", "name email")
        .populate("project", "name")
        .sort({ createdAt: -1 });
    } else {
      // Find tasks assigned to member
      tasks = await Task.find({ assignedTo: req.user.id })
        .populate("assignedTo", "name email")
        .populate("project", "name")
        .sort({ createdAt: -1 });
    }
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/tasks/:id/status
// @desc    Update task status
// @access  Private
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["To-Do", "In Progress", "Done"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    // Check authorization: Admin who created it or Member who is assigned
    if (task.createdBy.toString() !== req.user.id && task.assignedTo?.toString() !== req.user.id) {
        return res.status(401).json({ msg: "Not authorized to update this task" });
    }

    task.status = status;
    await task.save();
    
    const updatedTask = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("project", "name");

    res.json(updatedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/tasks/dashboard-stats
// @desc    Get stats for dashboard
// @access  Private
router.get("/dashboard-stats", auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "admin") {
      query.createdBy = req.user.id;
    } else {
      query.assignedTo = req.user.id;
    }

    const totalTasks = await Task.countDocuments(query);
    const todoTasks = await Task.countDocuments({ ...query, status: "To-Do" });
    const inProgressTasks = await Task.countDocuments({ ...query, status: "In Progress" });
    const doneTasks = await Task.countDocuments({ ...query, status: "Done" });

    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      ...query,
      status: { $ne: "Done" },
      dueDate: { $lt: now }
    });

    res.json({
      total: totalTasks,
      todo: todoTasks,
      inProgress: inProgressTasks,
      done: doneTasks,
      overdue: overdueTasks
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
