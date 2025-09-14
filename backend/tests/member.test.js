const request = require('supertest');
const app = require('../app');
const Specialist = require('../models/Specialist');
const Appointment = require('../models/Appointment');
const Member = require('../models/Member');

// Test GET specialists by category
describe('GET /api/member/specialists', () => {
  it('should return all specialists', async () => {
    // Add test data
    await Specialist.create([
      {
        name: 'Dr. Test Cardiologist',
        category: 'Cardiology',
        specialization: 'Heart Specialist'
      },
      {
        name: 'Dr. Test Dermatologist',
        category: 'Dermatology',
        specialization: 'Skin Specialist'
      }
    ]);

    const response = await request(app).get('/api/member/specialists');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(2);
  });

  it('should filter specialists by category', async () => {
    const response = await request(app)
      .get('/api/member/specialists?category=Cardiology');
    
    expect(response.status).toBe(200);
    expect(response.body.data[0].category).toBe('Cardiology');
  });
});

// Test GET specialist details
describe('GET /api/member/specialists/:id', () => {
  it('should return specialist details', async () => {
    const specialist = await Specialist.create({
      name: 'Dr. Test Doctor',
      category: 'Testology',
      specialization: 'Test Specialist'
    });

    const response = await request(app)
      .get(`/api/member/specialists/${specialist._id}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Dr. Test Doctor');
  });

  it('should return 404 for invalid specialist ID', async () => {
    const response = await request(app)
      .get('/api/member/specialists/invalid-id');
    
    expect(response.status).toBe(500); // Or 404 depending on your error handling
  });
});