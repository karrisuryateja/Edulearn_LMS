const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { auth, facultyAuth } = require('../middleware/auth');

// Create assignment (faculty only)
router.post('/', auth, facultyAuth, async (req, res) => {
  try {
    const { title, description, dueDate, courseId, sampleSolution, enableAIGrading, gradingCriteria } = req.body;
    
    // Check if course exists and belongs to faculty
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const assignment = new Assignment({
      title,
      description,
      dueDate,
      course: courseId,
      faculty: req.user.id,
      sampleSolution: sampleSolution || '',
      enableAIGrading: enableAIGrading || false,
      gradingCriteria: gradingCriteria || ''
    });
    
    await assignment.save();
    
    // Populate references
    await assignment.populate('course', 'title');
    await assignment.populate('faculty', 'name');
    
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get assignments for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('course', 'title')
      .populate('faculty', 'name');
    
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get assignment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title')
      .populate('faculty', 'name');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update assignment (faculty only, owner only)
router.put('/:id', auth, facultyAuth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if faculty owns this assignment
    // Convert both to strings for comparison
    if (assignment.faculty.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { title, description, dueDate, sampleSolution, enableAIGrading, gradingCriteria } = req.body;
    
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;
    assignment.sampleSolution = sampleSolution !== undefined ? sampleSolution : assignment.sampleSolution;
    assignment.enableAIGrading = enableAIGrading !== undefined ? enableAIGrading : assignment.enableAIGrading;
    assignment.gradingCriteria = gradingCriteria !== undefined ? gradingCriteria : assignment.gradingCriteria;
    
    await assignment.save();
    
    // Populate references
    await assignment.populate('course', 'title');
    await assignment.populate('faculty', 'name');
    
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete assignment (faculty only, owner only)
router.delete('/:id', auth, facultyAuth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if faculty owns this assignment
    // Convert both to strings for comparison
    if (assignment.faculty.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await assignment.remove();
    res.json({ message: 'Assignment removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;