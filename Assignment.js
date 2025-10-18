const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // AI Grading fields
  sampleSolution: {
    type: String,
    required: false
  },
  enableAIGrading: {
    type: Boolean,
    default: false
  },
  gradingCriteria: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);