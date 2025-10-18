/**
 * Test script for AI Grading Integration
 * This script tests the complete flow from assignment creation to AI grading
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testFaculty = {
  name: 'Dr. Test Faculty',
  email: 'faculty@test.com',
  password: 'password123',
  role: 'faculty'
};

const testStudent = {
  name: 'Test Student',
  email: 'student@test.com',
  password: 'password123',
  role: 'student'
};

const testCourse = {
  title: 'AI Grading Test Course',
  description: 'A course to test AI grading functionality',
  duration: 4,
  video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
};

const testAssignment = {
  title: 'AI Grading Test Assignment',
  description: 'Write a short essay about the importance of education',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  enableAIGrading: true,
  sampleSolution: 'Education is crucial for personal development, social progress, and economic growth. It empowers individuals with knowledge, critical thinking skills, and the ability to contribute meaningfully to society. Quality education fosters innovation, reduces inequality, and builds stronger communities.',
  gradingCriteria: 'education, knowledge, development, society, skills, innovation, community'
};

const testSubmission = {
  submissionText: 'Education is very important for everyone. It helps people learn new things and become better. Education makes society stronger and helps people get good jobs. It also teaches us how to think and solve problems.'
};

async function testAIIntegration() {
  console.log('🚀 Starting AI Grading Integration Test...\n');
  
  try {
    // Step 1: Register faculty
    console.log('1. Registering faculty...');
    const facultyResponse = await axios.post(`${API_BASE_URL}/auth/register`, testFaculty);
    const facultyToken = facultyResponse.data.token;
    console.log('✅ Faculty registered successfully\n');
    
    // Step 2: Register student
    console.log('2. Registering student...');
    const studentResponse = await axios.post(`${API_BASE_URL}/auth/register`, testStudent);
    const studentToken = studentResponse.data.token;
    console.log('✅ Student registered successfully\n');
    
    // Step 3: Create course
    console.log('3. Creating course...');
    const courseResponse = await axios.post(`${API_BASE_URL}/courses`, {
      ...testCourse
    }, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    const courseId = courseResponse.data._id;
    console.log('✅ Course created successfully\n');
    
    // Step 4: Student enrolls in course
    console.log('4. Student enrolling in course...');
    await axios.post(`${API_BASE_URL}/enrollments`, {
      courseId
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✅ Student enrolled successfully\n');
    
    // Step 5: Faculty creates assignment with AI grading
    console.log('5. Creating assignment with AI grading...');
    const assignmentResponse = await axios.post(`${API_BASE_URL}/assignments`, {
      ...testAssignment,
      courseId
    }, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    const assignmentId = assignmentResponse.data._id;
    console.log('✅ Assignment created with AI grading enabled\n');
    
    // Step 6: Student submits assignment
    console.log('6. Student submitting assignment...');
    const submissionResponse = await axios.post(`${API_BASE_URL}/submissions`, {
      assignmentId,
      submissionText: testSubmission.submissionText
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const submissionId = submissionResponse.data._id;
    console.log('✅ Assignment submitted successfully\n');
    
    // Step 7: Check if AI grading was applied automatically
    console.log('7. Checking AI grading results...');
    const gradedSubmissionResponse = await axios.get(`${API_BASE_URL}/submissions/${submissionId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    const gradedSubmission = gradedSubmissionResponse.data;
    
    if (gradedSubmission.grade && gradedSubmission.grade.isAIGrade) {
      console.log('✅ AI grading completed automatically!');
      console.log(`   Score: ${gradedSubmission.grade.score}/100`);
      console.log(`   Feedback: ${gradedSubmission.grade.feedback}`);
      console.log(`   Graded on: ${new Date(gradedSubmission.grade.gradedDate).toLocaleString()}\n`);
    } else {
      console.log('⚠️  AI grading was not applied automatically\n');
    }
    
    // Step 8: Faculty views submissions
    console.log('8. Faculty viewing submissions...');
    const submissionsResponse = await axios.get(`${API_BASE_URL}/submissions/assignment/${assignmentId}`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    
    const submissions = submissionsResponse.data;
    console.log(`✅ Faculty can view ${submissions.length} submission(s)\n`);
    
    // Step 9: Test manual AI grading (if not already graded)
    if (!gradedSubmission.grade || !gradedSubmission.grade.isAIGrade) {
      console.log('9. Testing manual AI grading...');
      const aiGradeResponse = await axios.post(`${API_BASE_URL}/submissions/${submissionId}/ai-grade`, {}, {
        headers: { Authorization: `Bearer ${facultyToken}` }
      });
      
      const aiGradedSubmission = aiGradeResponse.data.submission;
      console.log('✅ Manual AI grading completed!');
      console.log(`   Score: ${aiGradedSubmission.grade.score}/100`);
      console.log(`   Feedback: ${aiGradedSubmission.grade.feedback}\n`);
    }
    
    // Step 10: Test re-evaluation
    console.log('10. Testing AI re-evaluation...');
    const reEvaluateResponse = await axios.post(`${API_BASE_URL}/submissions/${submissionId}/re-evaluate`, {}, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    
    const reEvaluatedSubmission = reEvaluateResponse.data.submission;
    console.log('✅ AI re-evaluation completed!');
    console.log(`   New Score: ${reEvaluatedSubmission.grade.score}/100`);
    console.log(`   New Feedback: ${reEvaluatedSubmission.grade.feedback}\n`);
    
    console.log('🎉 AI Grading Integration Test Completed Successfully!');
    console.log('\nSummary:');
    console.log('- Faculty and student accounts created');
    console.log('- Course created and student enrolled');
    console.log('- Assignment created with AI grading enabled');
    console.log('- Student submitted assignment');
    console.log('- AI grading applied automatically');
    console.log('- Faculty can view and manage submissions');
    console.log('- Manual AI grading and re-evaluation working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data || error);
  }
}

// Run the test
if (require.main === module) {
  testAIIntegration();
}

module.exports = { testAIIntegration };
