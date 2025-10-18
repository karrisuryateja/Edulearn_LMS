const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { auth, facultyAuth } = require('../middleware/auth');
const AIGradingService = require('../services/aiGradingService');

// Submit assignment (students only)
router.post('/', auth, async (req, res) => {
  try {
    const { assignmentId, submissionText } = req.body;
    
    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user.id
    });
    
    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }
    
    // Create submission
    const submission = new Submission({
      assignment: assignmentId,
      student: req.user.id,
      submissionText
    });
    
    await submission.save();
    
    // Populate references
    await submission.populate('assignment', 'title');
    await submission.populate('student', 'name');
    
    // Check if AI grading is enabled and automatically grade the submission
    if (assignment.enableAIGrading && assignment.sampleSolution) {
      try {
        console.log('Auto-grading submission with AI...');
        const aiResult = AIGradingService.gradeSubmission(
          submission.submissionText,
          assignment.sampleSolution,
          assignment.gradingCriteria
        );
        
        // Update submission with AI grade
        submission.grade = {
          score: aiResult.score,
          feedback: aiResult.feedback,
          gradedBy: null, // AI graded
          gradedDate: new Date(),
          isAIGrade: true
        };
        
        await submission.save();
        console.log('Auto-grading completed successfully');
      } catch (aiError) {
        console.error('Auto-grading failed:', aiError);
        // Don't fail the submission if AI grading fails
      }
    }
    
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student's submissions (student only)
router.get('/my-submissions', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate('assignment', 'title course')
      .populate('student', 'name');
    
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get submissions for an assignment (faculty only, for their assignments)
router.get('/assignment/:assignmentId', auth, facultyAuth, async (req, res) => {
  try {
    console.log('=== SUBMISSIONS DEBUG INFO ===');
    console.log('Request params:', req.params);
    console.log('User:', req.user);
    console.log('Assignment ID:', req.params.assignmentId);
    console.log('Type of assignmentId:', typeof req.params.assignmentId);
    
    // Validate assignmentId
    if (!req.params.assignmentId) {
      console.log('Missing assignment ID');
      return res.status(400).json({ message: 'Assignment ID is required' });
    }
    
    // Check if assignment belongs to faculty
    const assignment = await Assignment.findById(req.params.assignmentId);
    console.log('Assignment lookup result:', assignment);
    
    if (!assignment) {
      console.log('Assignment not found for ID:', req.params.assignmentId);
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    console.log('Assignment faculty ID:', assignment.faculty);
    console.log('User ID:', req.user.id);
    console.log('Faculty match:', assignment.faculty.toString() === req.user.id.toString());
    
    // Check if user is faculty and owns this assignment
    if (assignment.faculty.toString() !== req.user.id.toString()) {
      console.log('Access denied - faculty does not own assignment');
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('assignment', 'title')
      .populate('student', 'name email');
    
    console.log('Submissions found:', submissions.length);
    console.log('=== END SUBMISSIONS DEBUG INFO ===');
    
    res.json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get submission by ID (for faculty to view details)
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignment', 'title sampleSolution enableAIGrading gradingCriteria faculty')
      .populate('student', 'name email')
      .populate('grade.gradedBy', 'name');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if user has access to this submission
    if (req.user.role === 'student' && submission.student._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (req.user.role === 'faculty' && submission.assignment.faculty.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Grade submission (faculty only, for their assignments)
router.put('/:id/grade', auth, async (req, res) => {
  try {
    const { score, feedback } = req.body;
    
    // Find submission
    const submission = await Submission.findById(req.params.id)
      .populate('assignment');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if assignment belongs to faculty
    // Convert both to strings for comparison
    if (req.user.role === 'faculty' && 
        submission.assignment.faculty.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update grade
    submission.grade = {
      score,
      feedback,
      gradedBy: req.user.id,
      gradedDate: new Date()
    };
    
    await submission.save();
    
    // Populate references
    await submission.populate('assignment', 'title');
    await submission.populate('student', 'name');
    await submission.populate('grade.gradedBy', 'name');
    
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// AI Grade submission (automated grading based on sample solution)
router.post('/:id/ai-grade', auth, async (req, res) => {
  try {
    // Find submission and populate assignment with sample solution
    const submission = await Submission.findById(req.params.id)
      .populate({
        path: 'assignment',
        select: 'title sampleSolution enableAIGrading gradingCriteria faculty'
      })
      .populate('student', 'name');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if assignment has AI grading enabled
    if (!submission.assignment.enableAIGrading) {
      return res.status(400).json({ message: 'AI grading is not enabled for this assignment' });
    }
    
    // Check if assignment belongs to faculty (if faculty is requesting)
    // Convert both to strings for comparison
    if (req.user.role === 'faculty' && 
        submission.assignment.faculty.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if assignment has a sample solution
    if (!submission.assignment.sampleSolution) {
      return res.status(400).json({ message: 'No sample solution provided for this assignment' });
    }
    
    // Perform AI grading
    const aiResult = AIGradingService.gradeSubmission(
      submission.submissionText,
      submission.assignment.sampleSolution,
      submission.assignment.gradingCriteria
    );
    
    // Update grade with AI results
    submission.grade = {
      score: aiResult.score,
      feedback: aiResult.feedback,
      gradedBy: null, // AI graded
      gradedDate: new Date(),
      isAIGrade: true
    };
    
    await submission.save();
    
    // Populate references
    await submission.populate('assignment', 'title');
    await submission.populate('student', 'name');
    
    res.json({
      submission,
      aiResult,
      message: 'Assignment successfully graded by AI'
    });
  } catch (err) {
    console.error('AI grading error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Re-evaluate submission with AI (re-grade an already AI-graded submission)
router.post('/:id/re-evaluate', auth, async (req, res) => {
  try {
    // Find submission and populate assignment with sample solution
    const submission = await Submission.findById(req.params.id)
      .populate({
        path: 'assignment',
        select: 'title sampleSolution enableAIGrading gradingCriteria faculty'
      })
      .populate('student', 'name');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if assignment has AI grading enabled
    if (!submission.assignment.enableAIGrading) {
      return res.status(400).json({ message: 'AI grading is not enabled for this assignment' });
    }
    
    // Check if assignment belongs to faculty (if faculty is requesting)
    // Convert both to strings for comparison
    if (req.user.role === 'faculty' && 
        submission.assignment.faculty.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if assignment has a sample solution
    if (!submission.assignment.sampleSolution) {
      return res.status(400).json({ message: 'No sample solution provided for this assignment' });
    }
    
    // Check if submission was previously AI graded
    if (!submission.grade || !submission.grade.isAIGrade) {
      return res.status(400).json({ message: 'This submission was not previously AI graded' });
    }
    
    // Perform AI grading
    const aiResult = AIGradingService.gradeSubmission(
      submission.submissionText,
      submission.assignment.sampleSolution,
      submission.assignment.gradingCriteria
    );
    
    // Update grade with new AI results
    submission.grade = {
      score: aiResult.score,
      feedback: aiResult.feedback,
      gradedBy: null, // AI graded
      gradedDate: new Date(),
      isAIGrade: true
    };
    
    await submission.save();
    
    // Populate references
    await submission.populate('assignment', 'title');
    await submission.populate('student', 'name');
    
    res.json({
      submission,
      aiResult,
      message: 'Assignment successfully re-evaluated by AI'
    });
  } catch (err) {
    console.error('AI re-evaluation error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;