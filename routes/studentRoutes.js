// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// Auth middleware import
const { auth, coordinatorOnly } = require("../middleware/authMiddleware");

// GET all students (Login required for both roles)
router.get("/", auth, async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD new student (Coordinator only)
router.post("/", auth, coordinatorOnly, async (req, res) => {
  try {
    const { name, email, course, year, rollNumber } = req.body;

    if (!name || !email || !course || !year || !rollNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmail = await Student.findOne({ email });
    const existingRoll = await Student.findOne({ rollNumber });

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (existingRoll) {
      return res.status(400).json({ message: "Roll number already exists" });
    }

    const newStudent = new Student({
      name,
      email,
      course,
      year,
      rollNumber,
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    console.error("Error adding student:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE student (Coordinator only)
router.put("/:id", auth, coordinatorOnly, async (req, res) => {
  try {
    const { name, email, course, year, rollNumber } = req.body;

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, course, year, rollNumber },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE student (Coordinator only)
router.delete("/:id", auth, coordinatorOnly, async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
