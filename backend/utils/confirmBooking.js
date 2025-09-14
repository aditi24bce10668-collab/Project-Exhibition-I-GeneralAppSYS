const Appointment = require('../models/Appointment');

module.exports = async function confirmBooking(appointment, { member, specialist }) {
  // Refresh appointment from DB
  const appt = await Appointment.findById(appointment._id);
  const autoConfirm = specialist?.metadata?.autoConfirm === true;

  if (autoConfirm) {
    appt.status = 'confirmed';
    appt.autoConfirmed = true;
    await appt.save();

    // TODO: send notification/email to member & specialist
    return { autoConfirmed: true, message: 'Appointment auto-confirmed' };
  }

  // leave as pending (manual confirm by specialist/admin)
  return { autoConfirmed: false, message: 'Appointment pending specialist confirmation' };
};
