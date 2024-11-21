const express = require('express');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from the Authorization header
  if (!token) return res.status(401).json({ message: 'Unauthorized' }); // If no token, return Unauthorized error

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' }); // If token is invalid, return Forbidden error
    req.userId = decoded.id; // Attach user ID to the request object
    next(); // Proceed to the next middleware/route handler
  });
};

// Create Task
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, priority, deadline } = req.body;
    const task = new Task({ userId: req.userId, title, description, priority, deadline }); // Create task with userId
    await task.save(); // Save task to the database
    res.status(201).json(task); // Return created task in response
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle error if saving the task fails
  }
});

// Get Tasks
router.get('/', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }); // Fetch tasks for the authenticated user
    res.json(tasks); // Return tasks as JSON
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle error if fetching tasks fails
  }
});

// Update Task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Update task by ID
    res.json(updatedTask); // Return updated task in response
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle error if updating task fails
  }
});

// Delete Task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id); // Delete task by ID
    res.json({ message: 'Task deleted' }); // Return success message
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle error if deleting task fails
  }
});

module.exports = router;
