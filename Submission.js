const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissionText: {
    type: String,
    required: true
  },
  grade: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: {
      type: String
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedDate: {
      type: Date
    },
    isAIGrade: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);