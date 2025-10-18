const axios = require('axios');

async function testFullFlow() {
    try {
        const API_BASE_URL = 'http://localhost:5000/api';
        const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjEyYzVjZGM3M2JjYzUwZDVhNjBkMyIsImlhdCI6MTc2MDczNzA2MCwiZXhwIjoxNzYxMzQxODYwfQ.-7_LNmTCmhuzgmjWUMbgA2aEkMf2IGrRZFJ9vQ3dDCg";
        const loggedInUser = {
            "id": "68f12c5cdc73bcc50d5a60d3",
            "name": "Dr. Smith",
            "email": "dr.smith@university.edu",
            "role": "faculty"
        };
        
        console.log('Loading courses...');
        
        // Fetch courses
        const response = await axios.get(`${API_BASE_URL}/courses`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const courses = response.data;
        console.log('Courses received:', courses.length, 'courses');
        
        // Apply filtering
        const facultyCourses = courses.filter(course => {
            if (course.faculty && typeof course.faculty === 'object') {
                return course.faculty._id === loggedInUser.id;
            } else {
                return course.faculty === loggedInUser.id;
            }
        });
        
        console.log('Faculty courses count:', facultyCourses.length);
        
        if (facultyCourses.length === 0) {
            console.log('No courses found for this faculty.');
        } else {
            console.log('Faculty courses:');
            facultyCourses.forEach(course => {
                console.log('- ' + course.title);
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testFullFlow();