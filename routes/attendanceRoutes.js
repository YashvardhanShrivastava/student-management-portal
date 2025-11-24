const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const { auth, coordinatorOnly } = require("../middleware/authMiddleware");


// Create or update attendance for a day
router.post("/mark", auth, coordinatorOnly, async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !records) {
      return res.status(400).json({ message: "Date and records required" });
    }

    let attendance = await Attendance.findOne({ date });

    if (attendance) {
      attendance.records = records; // updating
    } else {
      attendance = new Attendance({ date, records });
    }

    await attendance.save();
    res.json({ message: "Attendance saved", attendance });

  } catch (err) {
    console.error("Attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Get attendance of a specific day
router.get("/day/:date", auth, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ date: req.params.date })
      .populate("records.studentId", "name email rollNumber");

    res.json(attendance || {});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// Student → view own attendance
router.get("/my-attendance", auth, async (req, res) => {
  try {
    const studentId = req.user.userId;

    const all = await Attendance.find().lean();
    const myRecords = all.map((day) => {
      const entry = day.records.find(r => r.studentId.toString() === studentId);
      return {
        date: day.date,
        status: entry ? entry.status : "Absent",
      };
    });

    res.json(myRecords);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
