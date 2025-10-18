const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { auth, studentAuth, facultyAuth } = require('../middleware/auth');

// Enroll in a course (student only)
router.post('/', auth, studentAuth, async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Create enrollment
    const enrollment = new Enrollment({
      student: req.user.id,
      course: courseId
    });
    
    await enrollment.save();
    
    // Populate references
    await enrollment.populate('student', 'name email');
    await enrollment.populate('course', 'title description');
    
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student's enrollments (student only)
router.get('/my-enrollments', auth, studentAuth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate('course', 'title description duration video')
      .populate('student', 'name email');
    
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get course enrollments (faculty only, for their courses)
router.get('/course/:courseId', auth, facultyAuth, async (req, res) => {
  try {
    // Check if course belongs to faculty
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You are not the instructor of this course.' });
    }
    
    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'name email')
      .populate('course', 'title');
    
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;