const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { auth } = require('../middleware/auth');

// Get leaderboard for a specific assignment
router.get('/assignment/:assignmentId', auth, async (req, res) => {
  try {
    // Find the assignment
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Get all graded submissions for this assignment, sorted by score (descending)
    const submissions = await Submission.find({ 
      assignment: req.params.assignmentId,
      'grade.score': { $exists: true, $ne: null }
    })
    .populate('student', 'name')
    .sort({ 'grade.score': -1, 'createdAt': 1 }); // Sort by score (desc) then by submission time (asc)
    
    // Format leaderboard data
    const leaderboard = submissions.map((submission, index) => ({
      rank: index + 1,
      studentName: submission.student.name,
      score: submission.grade.score,
      submissionDate: submission.createdAt,
      submissionId: submission._id
    }));
    
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get detailed leaderboard across all assignments for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    // Get all assignments for this course
    const assignments = await Assignment.find({ course: req.params.courseId });
    const assignmentIds = assignments.map(a => a._id);
    
    // Get all graded submissions for these assignments, sorted by score (descending) then by submission time (ascending)
    const submissions = await Submission.find({ 
      assignment: { $in: assignmentIds },
      'grade.score': { $exists: true, $ne: null }
    })
    .populate('student', 'name')
    .populate('assignment', 'title')
    .sort({ 'grade.score': -1, 'createdAt': 1 });
    
    // Format leaderboard data to show individual submissions
    const leaderboard = submissions.map((submission, index) => ({
      rank: index + 1,
      studentName: submission.student.name,
      score: submission.grade.score,
      assignmentTitle: submission.assignment.title,
      submissionDate: submission.createdAt,
      submissionId: submission._id
    }));
    
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;