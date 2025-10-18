const loggedInUser = { id: '68f12c5cdc73bcc50d5a60d3' };
const courses = [
  { 
    title: 'Test Course', 
    faculty: { _id: '68f12a79fa2f79a74ae84840' } 
  }, 
  { 
    title: 'Introduction to Computer Science', 
    faculty: { _id: '68f12c5cdc73bcc50d5a60d3' } 
  }
];

console.log('User ID:', loggedInUser.id);
console.log('All courses:', courses);

const facultyCourses = courses.filter(course => {
  console.log('Checking course:', course.title, 'with faculty:', course.faculty);
  if (course.faculty && typeof course.faculty === 'object') {
    const result = course.faculty._id === loggedInUser.id;
    console.log('Object comparison result:', result);
    return result;
  } else {
    const result = course.faculty === loggedInUser.id;
    console.log('ID comparison result:', result);
    return result;
  }
});

console.log('Faculty courses count:', facultyCourses.length);
facultyCourses.forEach(course => console.log('Course:', course.title));