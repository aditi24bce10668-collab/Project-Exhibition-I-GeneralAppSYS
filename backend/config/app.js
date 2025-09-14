// app.js - Complete Express Server for Appointment System
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.log('MongoDB connection error:', err));

// Basic routes for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Appointment System Backend!',
    endpoints: {
      health: '/api/health',
      specialists: '/api/member/specialists',
      specialistDetails: '/api/member/specialists/:id',
      appointments: '/api/member/appointments'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running successfully',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Sample data route for testing
app.get('/api/member/specialists', (req, res) => {
  // Temporary sample data - replace with database integration later
  const sampleSpecialists = [
    {
      id: 1,
      name: 'Dr. John Smith',
      category: 'Cardiology',
      specialization: 'Heart Specialist',
      experience: 15,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Dr. Jane Doe',
      category: 'Dermatology',
      specialization: 'Skin Specialist',
      experience: 10,
      rating: 4.6
    },
    {
      id: 3,
      name: 'Dr. Mike Johnson',
      category: 'Cardiology',
      specialization: 'Cardiac Surgeon',
      experience: 12,
      rating: 4.9
    }
  ];

  // Filter by category if provided
  const { category } = req.query;
  let filteredSpecialists = sampleSpecialists;
  
  if (category) {
    filteredSpecialists = sampleSpecialists.filter(
      specialist => specialist.category.toLowerCase() === category.toLowerCase()
    );
  }

  res.json({
    success: true,
    count: filteredSpecialists.length,
    data: filteredSpecialists
  });
});

// Sample specialist details route
app.get('/api/member/specialists/:id', (req, res) => {
  const { id } = req.params;
  const sampleSpecialists = [
    {
      id: 1,
      name: 'Dr. John Smith',
      category: 'Cardiology',
      specialization: 'Heart Specialist',
      experience: 15,
      education: ['MBBS', 'MD in Cardiology'],
      availability: {
        days: ['Monday', 'Wednesday', 'Friday'],
        startTime: '09:00',
        endTime: '17:00'
      },
      contact: {
        email: 'john.smith@hospital.com',
        phone: '+1234567890'
      },
      rating: 4.8,
      reviews: [
        {
          memberName: 'Patient A',
          rating: 5,
          comment: 'Excellent doctor!',
          date: '2023-11-15'
        }
      ]
    }
  ];

  const specialist = sampleSpecialists.find(s => s.id === parseInt(id));
  
  if (!specialist) {
    return res.status(404).json({
      success: false,
      message: 'Specialist not found'
    });
  }

  res.json({
    success: true,
    data: specialist
  });
});

// Sample appointment booking route
app.post('/api/member/appointments', (req, res) => {
  const { specialistId, date, timeSlot, reason } = req.body;
  
  // Basic validation
  if (!specialistId || !date || !timeSlot) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: specialistId, date, timeSlot'
    });
  }

  // Simulate appointment creation
  const newAppointment = {
    id: Date.now(),
    specialistId,
    date,
    timeSlot,
    reason,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: newAppointment
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;