const DoctorList = require("../Models/doctorlistModel");
const { checkSchema,check, validationResult } = require('express-validator'); // Import express-validator for route validation
const Slot = require("../Models/slotsModels");
//re
console.log("any error here")
// Validation schema
const doctorValidationSchema = checkSchema({
    name: {
        notEmpty: { errorMessage: 'Name is required' },
        isLength: { options: { min: 3 }, errorMessage: 'Name must be at least 3 characters long' }
    },
    specialty: { notEmpty: { errorMessage: 'Specialty is required' } },
    phonenumber: {
        notEmpty: { errorMessage: 'Phone number is required' },
        isLength: { options: { min: 10, max: 10 }, errorMessage: 'Phone number must be exactly 10 digits' }
    },
    dateOfBirth: { notEmpty: { errorMessage: 'Date of Birth is required' } },
    address: { notEmpty: { errorMessage: 'Address is required' } },
    email: {
        notEmpty: { errorMessage: 'Email is required' },
        isEmail: { errorMessage: 'Please enter a valid email' }
    },
    availability: {
        notEmpty: { errorMessage: 'Availability is required' },
        isIn: { options: [['Morning', 'Afternoon', 'Evening', 'FullDay']], errorMessage: 'Invalid availability option' }
    },
    degree: { notEmpty: { errorMessage: 'Degree is required' } }
});

// Middleware to handle validation errors
const validateDoctor = async (req, res, next) => {
    await Promise.all(doctorValidationSchema.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ err: errors.array() });
    }

    next(); // Proceed to the controller if validation passes
};

const generateSlots = (shift, selectedDate) => {
    const shiftTimings = {
        Morning: { start: 8, end: 11 },
        Afternoon: { start: 12, end: 16 },
        Evening: { start: 16, end: 19 },
        FullDay: { start: 9, end: 18 }
    };

    if (!shiftTimings[shift]) return [];

    let { start, end } = shiftTimings[shift];
    let slots = [];
    let currentDate = new Date(selectedDate); // Date of booking

    for (let hour = start; hour < end; hour++) {
        slots.push({
            date: new Date(currentDate), // Same day
            time: `${hour}:00 - ${(hour + 1)}:00`,
            status: 'available',
            patientId: null
        });
    }

    return slots;
};

exports.createDoctor = async (req, res) => {
    try {
        const { email, availability } = req.body;

        // Check if doctor already exists
        const existingDoctor = await DoctorList.findOne({ email });
        if (existingDoctor) {
            return res.status(409).json({ error: "Email already exists" });
        }

        // Create new doctor
        const doctor = new DoctorList(req.body);
        await doctor.save();

        // Generate slots and store separately
        let slots = [];
        if (availability) {
            availability.forEach((shift) => {
                const generatedSlots = generateSlots(shift, new Date());
                generatedSlots.forEach((slot) => {
                    slots.push({
                        doctorId: doctor._id,
                        date: slot.date,
                        time: slot.time,
                        status: slot.status,
                        patientId: slot.patientId
                    });
                });
            });
        }

        // Save slots in Slot collection
        await Slot.insertMany(slots);

        // Fetch the saved slots and send in response
        const savedSlots = await Slot.find({ doctorId: doctor._id });

        res.status(201).json({ 
            message: "Doctor added successfully", 
            data: { 
                doctor, 
                slots: savedSlots 
            } 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await DoctorList.find();
        res.status(200).json({ data: doctors });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a doctor by ID
exports.getDoctorById = async (req, res) => {
    // Validation for getDoctorById route
    await check('id', 'Invalid ID').isMongoId().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const doctor = await DoctorList.findById(req.params.id);
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
        res.status(200).json({ data: doctor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a doctor's details by ID
exports.updateDoctor = async (req, res) => {
    // Validation for updateDoctor route
    await check('id', 'Invalid ID').isMongoId().run(req);
    await check('name', 'Name must be at least 3 characters long').isLength({ min: 3 }).run(req);
    await check('specialty', 'Specialty is required').not().isEmpty().run(req);
    await check('phonenumber', 'Phone number must be exactly 10 digits').isLength({ min: 10, max: 10 }).run(req);
    await check('dateOfBirth', 'Date of Birth is required').not().isEmpty().run(req);
    await check('address', 'Address is required').not().isEmpty().run(req);
    await check('email', 'Please enter a valid email').isEmail().run(req);
    await check('availability', 'Invalid availability option').isIn(['Morning', 'Afternoon', 'Evening', 'Full Day']).run(req);
    await check('degree', 'Degree is required').not().isEmpty().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const doctor = await DoctorList.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
        res.status(200).json({ message: 'Doctor updated successfully', data: doctor });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a doctor by ID
exports.deleteDoctor = async (req, res) => {
    // Validation for deleteDoctor route
    await check('id', 'Invalid ID').isMongoId().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const doctor = await DoctorList.findByIdAndDelete(req.params.id);
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
        res.status(200).json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
