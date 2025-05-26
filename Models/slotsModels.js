const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true }, // Date of appointment
    time: { type: String, required: true }, // Time slot (e.g., "10:00 AM")
    status: { type: String, enum: ['available', 'booked'], default: 'available' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // If booked, store patientId
});

module.exports = mongoose.model('Slot', slotSchema);
    