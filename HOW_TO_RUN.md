# How to Run the EduLearn LMS with Node.js Backend and MongoDB

This document explains how to run the complete Learning Management System with the Node.js backend and MongoDB database.

## 🛠️ Prerequisites

Before running the application, ensure you have the following installed:
- Node.js (version 14 or higher)
- MongoDB (version 4.0 or higher)
- Git (optional, for cloning the repository)

## 🚀 Setup Instructions

### 1. Start MongoDB

Make sure MongoDB is running on your system. If you haven't installed MongoDB yet:

1. Download MongoDB from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install MongoDB following the installation instructions for your operating system
3. Start the MongoDB service:
   - **Windows**: MongoDB should start automatically as a service
   - **macOS/Linux**: Run `mongod` in a terminal

### 2. Configure the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   The `.env` file in the backend directory should contain:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/lms
   JWT_SECRET=edulearn_lms_secret_key_2025
   ```

### 3. Start the Backend Server

```bash
npm start
```

The backend server will start on port 5000. You should see output similar to:
```
Server is running on port 5000
MongoDB connected
```

### 4. Use the Frontend Application

The frontend files (`index.html`, `login.html`, `student.html`, `faculty.html`) are already configured to connect to the backend running on `http://localhost:5000`.

Simply open `index.html` in your web browser to start using the application.

## 🎯 How to Use the Application

### For Students:
1. Open `index.html` in your browser
2. Click "Student Login" 
3. Register a new account or login with:
   - Email: `student@test.com`
   - Password: `student123`
4. Browse courses and enroll
5. Submit assignments and view grades

### For Faculty:
1. Open `index.html` in your browser
2. Click "Faculty Login"
3. Register a new account or login with:
   - Email: `faculty@test.com`
   - Password: `faculty123`
4. Create courses and assignments
5. Grade student submissions

## 🔧 API Endpoints

The backend provides the following RESTful API endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Courses
- `POST /api/courses` - Create a new course (faculty only)
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get a specific course
- `PUT /api/courses/:id` - Update a course (faculty only)
- `DELETE /api/courses/:id` - Delete a course (faculty only)

### Enrollments
- `POST /api/enrollments` - Enroll in a course (student only)
- `GET /api/enrollments/my-enrollments` - Get student's enrollments (student only)
- `GET /api/enrollments/course/:courseId` - Get course enrollments (faculty only)

### Assignments
- `POST /api/assignments` - Create an assignment (faculty only)
- `GET /api/assignments/course/:courseId` - Get assignments for a course
- `GET /api/assignments/:id` - Get a specific assignment
- `PUT /api/assignments/:id` - Update an assignment (faculty only)
- `DELETE /api/assignments/:id` - Delete an assignment (faculty only)

### Submissions
- `POST /api/submissions` - Submit an assignment (student only)
- `GET /api/submissions/my-submissions` - Get student's submissions (student only)
- `GET /api/submissions/assignment/:assignmentId` - Get submissions for an assignment (faculty only)
- `PUT /api/submissions/:id/grade` - Grade a submission (faculty only)

## 📁 Project Structure

```
project/
├── backend/                 # Node.js backend
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Authentication & validation
│   ├── models/              # Database models
│   ├── routes/              # API route definitions
│   ├── .env                 # Environment variables
│   ├── package.json         # Dependencies & scripts
│   └── server.js            # Main server file
├── index.html               # Landing page
├── login.html               # Authentication page
├── student.html             # Student dashboard
└── faculty.html             # Faculty dashboard
```

## 🔐 Security Features

- **JWT Authentication**: Secure user sessions with JSON Web Tokens
- **Password Hashing**: Passwords are hashed using bcrypt
- **Role-based Access Control**: Different permissions for students and faculty
- **Input Validation**: All API endpoints validate input data
- **Error Handling**: Proper error responses without exposing sensitive information

## 🧪 Testing the API

You can test the API endpoints using the provided test scripts:

1. Run the basic API test:
   ```bash
   node test-api.js
   ```

2. Run the full workflow test:
   ```bash
   node test-full.js
   ```

## 🌐 Deployment

### Backend Deployment Options:
1. **Render**: [https://render.com](https://render.com)
2. **Heroku**: [https://heroku.com](https://heroku.com)
3. **DigitalOcean App Platform**: [https://www.digitalocean.com/products/app-platform](https://www.digitalocean.com/products/app-platform)

### Database Deployment Options:
1. **MongoDB Atlas**: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **MongoDB Cloud**: [https://www.mongodb.com/cloud](https://www.mongodb.com/cloud)

### Frontend Deployment Options:
1. **Vercel**: [https://vercel.com](https://vercel.com)
2. **Netlify**: [https://netlify.com](https://netlify.com)
3. **GitHub Pages**: [https://pages.github.com](https://pages.github.com)

## 🆘 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in the .env file
   - Verify MongoDB is accessible on localhost:27017

2. **Port Already in Use**
   - Change the PORT in .env file to a different port
   - Or stop the process using port 5000

3. **JWT Token Errors**
   - Ensure JWT_SECRET is set in .env file
   - Restart the server after changing environment variables

4. **CORS Errors**
   - The backend already includes CORS middleware
   - Ensure you're accessing the correct API endpoints

### Browser Support:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📱 Mobile Compatibility

The application is fully responsive and works on:
- Smartphones
- Tablets
- Desktop computers

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.