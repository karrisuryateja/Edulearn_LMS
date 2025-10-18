const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth, facultyAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

// Create course (faculty only)
router.post('/', auth, facultyAuth, async (req, res) => {
  try {
    const { title, description, duration, video, materials } = req.body;
    
    const course = new Course({
      title,
      description,
      duration,
      video,
      faculty: req.user.id,
      materials: materials || []
    });
    
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('faculty', 'name');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('faculty', 'name');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update course (faculty only, owner only)
router.put('/:id', auth, facultyAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if faculty owns this course
    if (course.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { title, description, duration, video } = req.body;
    
    course.title = title || course.title;
    course.description = description || course.description;
    course.duration = duration || course.duration;
    course.video = video || course.video;
    
    // Only update materials if explicitly provided
    if (req.body.materials) {
      course.materials = req.body.materials;
    }
    
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete course (faculty only, owner only)
router.delete('/:id', auth, facultyAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if faculty owns this course
    if (course.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await course.remove();
    res.json({ message: 'Course removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add material to course
router.post('/:id/materials', auth, facultyAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if faculty owns this course
    if (course.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { title, url } = req.body;
    
    // Validate required fields
    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }
    
    course.materials.push({
      title,
      url
    });
    
    await course.save();
    
    // Return the updated course with populated faculty info
    const updatedCourse = await Course.findById(course._id).populate('faculty', 'name');
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload file as material to course
router.post('/:id/materials/upload', auth, facultyAuth, upload.single('file'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if faculty owns this course
    if (course.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { title } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Create file URL (relative to server) and store original filename
    const fileUrl = `/uploads/${req.file.filename}`;
    const originalFilename = req.file.originalname;
    
    const material = {
      title,
      url: fileUrl,
      originalFilename: originalFilename
    };
    
    course.materials.push(material);
    
    await course.save();
    
    // Return the updated course with populated faculty info
    const updatedCourse = await Course.findById(course._id).populate('faculty', 'name');
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete material from course
router.delete('/:id/materials/:materialId', auth, facultyAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if faculty owns this course
    if (course.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const materialId = req.params.materialId;
    const materialIndex = course.materials.findIndex(material => 
      material._id.toString() === materialId
    );
    
    if (materialIndex === -1) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    course.materials.splice(materialIndex, 1);
    
    await course.save();
    
    // Return the updated course with populated faculty info
    const updatedCourse = await Course.findById(course._id).populate('faculty', 'name');
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Serve uploaded files
router.use('/uploads', express.static('uploads'));

// Download file endpoint
router.get('/download/:courseId/:materialId', async (req, res) => {
  try {
    const { courseId, materialId } = req.params;
    
    // Find the course and material
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find the material in the course
    const material = course.materials.id(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    // Check if it's a local file (starts with /uploads/)
    if (material.url.startsWith('/uploads/')) {
      const filename = path.basename(material.url);
      const filePath = path.join(__dirname, '../uploads', filename);
      
      // Use original filename if available, otherwise use the stored filename
      const downloadFilename = material.originalFilename || filename;
      
      // Set headers to force download
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // Send file
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          if (!res.headersSent) {
            res.status(404).json({ message: 'File not found' });
          }
        }
      });
    } else {
      // For external URLs, redirect to the original URL
      res.redirect(material.url);
    }
  } catch (err) {
    console.error('Error downloading file:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;