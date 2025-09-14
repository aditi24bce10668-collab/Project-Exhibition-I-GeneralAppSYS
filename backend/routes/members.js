const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Specialist = require('../models/Specialist');
const Appointment = require('../models/Appointment');
const confirmBooking = require('../utils/confirmBooking');

// GET /api/members/doctors?category=Cardiology
router.get('/doctors', async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20, search } = req.query;
    const q = {};
    if (category) q.category = { $regex: new RegExp(`^${category}$`, 'i') };
    if (search) q.name = { $regex: new RegExp(search, 'i') };

    const total = await Specialist.countDocuments(q);
    const doctors = await Specialist.find(q)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({ data: doctors, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
});

// GET /api/members/doctors/:id
router.get('/doctors/:id', async (req, res, next) => {
  try {
    const doc = await Specialist.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ data: doc });
  } catch (err) { next(err); }
});

// POST /api/members/appointments
// body: { memberId, specialistId, datetime (ISO), duration?, reason? }
router.post('/appointments', async (req, res, next) => {
  try {
    const { memberId, specialistId, datetime, duration = null, reason } = req.body;
    if (!memberId || !specialistId || !datetime) {
      return res.status(400).json({ error: 'memberId, specialistId and datetime are required' });
    }

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const specialist = await Specialist.findById(specialistId);
    if (!specialist) return res.status(404).json({ error: 'Specialist not found' });

    const slotDuration = duration || specialist.slotDuration || 30;
    const apptStart = new Date(datetime);
    if (isNaN(apptStart)) return res.status(400).json({ error: 'Invalid datetime' });
    if (apptStart < new Date()) return res.status(400).json({ error: 'Cannot book for past datetime' });

    const apptEnd = new Date(apptStart.getTime() + slotDuration * 60000);

    // Check overlapping appointments for the specialist
    const overlapping = await Appointment.findOne({
      specialist: specialist._id,
      status: { $in: ['pending', 'confirmed'] },
      $expr: {
        $and: [
          { $lt: ['$datetime', apptEnd] }, // existing.start < new.end
          { $gt: [{ $add: ['$datetime', { $multiply: ['$duration', 60000] }] }, apptStart] } // existing.end > new.start
        ]
      }
    });

    if (overlapping) return res.status(409).json({ error: 'Specialist not available at chosen time' });

    // create appointment (pending by default)
    const appointment = await Appointment.create({
      member: member._id,
      specialist: specialist._id,
      datetime: apptStart,
      duration: slotDuration,
      reason: reason || ''
    });

    // run confirmation logic (auto-confirm if allowed)
    const confirmation = await confirmBooking(appointment, { member, specialist });

    // return current appointment state and confirmation info
    const fresh = await Appointment.findById(appointment._id).lean();
    res.status(201).json({ appointment: fresh, confirmation });
  } catch (err) { next(err); }
});

// GET /api/members/appointments/:id
router.get('/appointments/:id', async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id).populate('member specialist').lean();
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ data: appt });
  } catch (err) { next(err); }
});

// PUT /api/members/appointments/:id/confirm  (for manual confirmation endpoint)
router.put('/appointments/:id/confirm', async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    appt.status = 'confirmed';
    appt.autoConfirmed = false;
    await appt.save();
    res.json({ message: 'Appointment confirmed', appointment: appt });
  } catch (err) { next(err); }
});

module.exports = router;
