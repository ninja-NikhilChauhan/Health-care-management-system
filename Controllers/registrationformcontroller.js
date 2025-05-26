const RegistrationForm = require('../Models/registrationformModel');
const { updateMessage } = require("../config/email");
const { checkSchema, validationResult } = require('express-validator'); // Import express-validator for route validation
const DoctorList = require("../Models/doctorlistModel");
const Booking =require("../Models/appointmentBookingModels")
const Slot = require("../Models/slotsModels");
const mongoose = require("mongoose");

// Validation schema for appointment creation
const appointmentCreationValidationSchema = checkSchema({
    email: {
        notEmpty: { errorMessage: 'Email is required' },
        isEmail: { errorMessage: 'Please enter a valid email' }
    },
    phonenumber: {
        notEmpty: { errorMessage: 'Phone number is required' },
        isLength: { options: { min: 10, max: 15 }, errorMessage: 'Phone number must be between 10 to 15 digits' }
    },
    dateOfBirth: {
        notEmpty: { errorMessage: 'Date of birth is required' },
        custom: {
            options: (value) => {
                const inputDate = new Date(value)
                return inputDate < new Date()
            },
            errorMessage: 'Date of birth must be a past date'
        }
    },
    address: {
        notEmpty: { errorMessage: 'Address is required' }
    },
    description: {
        notEmpty: { errorMessage: 'Description is required' }
    },
    doctorname: {
        notEmpty: { errorMessage: 'Doctor name is required' }
    },
});

// Validation schema for appointment update
const appointmentUpdateValidationSchema = checkSchema({
    id: {
        isMongoId: { errorMessage: 'Invalid ID' }
    },
    status: {
        notEmpty: { errorMessage: 'Status is required' },
        isIn: { options: [['Pending', 'Accepted', 'Rejected']], errorMessage: 'Invalid status option' }
    }
});

// Validation schema for appointment deletion
const appointmentDeletionValidationSchema = checkSchema({
    id: {
        isMongoId: { errorMessage: 'Invalid ID' }
    }
});

// Middleware to handle validation errors
const validateAppointmentCreation = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(400).json({ errors: errors.array() });
    }

    next(); // Proceed to the controller if validation passes
};

const validateAppointmentUpdate = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next(); // Proceed to the controller if validation passes
};

const validateAppointmentDeletion = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next(); // Proceed to the controller if validation passes
};

// Create a new appointment

// Create a new appointment with Transaction
// exports.createAppointment = [
//     async (req, res) => {
//         const session = await mongoose.startSession();
//         session.startTransaction();

//         try {
//             const { doctorId, slotId, patientId, ...restData } = req.body;
// console.log(req.body)
//             const tomorrowDate = new Date();
//             tomorrowDate.setDate(tomorrowDate.getDate() + 1);
//             const tomorrowDateISO = tomorrowDate.toISOString().split('T')[0];

//             // Check if the slot is already booked
//             const existingBooking = await Booking.findOne(
//                 { doctorId, slotId, date: new Date(tomorrowDateISO) },
//                 null,
//                 { session }
//             );

//             if (existingBooking) {
//                 await session.abortTransaction();
//                 session.endSession();
//                 return res.status(200).json({ message: "This slot is already booked. Please choose another slot." });
//             }

//             // Create booking
//             const newBooking = new Booking({
//                 doctorId,
//                 slotId,
//                 patientId,
//                 date: new Date(tomorrowDateISO)
//             });
//             await newBooking.save({ session });

//             // Save complete registration form data
//             const newForm = new RegistrationForm({
//                 bookingDate: new Date(tomorrowDateISO),
//                 ...restData // Store the rest of the req.body fields
//             });
//             await newForm.save({ session });

//             await session.commitTransaction();
//             session.endSession();

//             return res.status(201).json({
//                 message: "Appointment created and registration form saved successfully!",
//                 data: {
//                     booking: newBooking,
//                     registrationForm: newForm
//                 }
//             });

//         } catch (error) {
//             console.error("Error creating appointment:", error);
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(500).json({ error: "Internal Server Error" });
//         }
//     }
// ];
// Update to createAppointment function in registrationformcontroller.js
exports.createAppointment = [
    async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { doctorId, slotId, patientId, medicalDocumentUrl, ...restData } = req.body;
            console.log(req.body);

            const tomorrowDate = new Date();
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            const tomorrowDateISO = tomorrowDate.toISOString().split('T')[0];

            // Check if the slot is already booked
            const existingBooking = await Booking.findOne(
                { doctorId, slotId, date: new Date(tomorrowDateISO) },
                null,
                { session }
            );

            if (existingBooking) {
                await session.abortTransaction();
                session.endSession();
                return res.status(200).json({ message: "This slot is already booked. Please choose another slot." });
            }

            // Create booking
            const newBooking = new Booking({
                doctorId,
                slotId,
                patientId,
                date: new Date(tomorrowDateISO)
            });
            await newBooking.save({ session });

            // Save complete registration form data with document URL if available
            const formData = {
                bookingDate: new Date(tomorrowDateISO),
                ...restData
            };
            
            // Add medical document URL if it exists
            if (medicalDocumentUrl) {
                formData.medicalDocumentUrl = medicalDocumentUrl;
            }
            
            const newForm = new RegistrationForm(formData);
            await newForm.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({
                message: "Appointment created and registration form saved successfully!",
                data: {
                    booking: newBooking,
                    registrationForm: newForm
                }
            });

        } catch (error) {
            console.error("Error creating appointment:", error);
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
];




// Get available slots for a doctor
exports.getAllSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ error: "Invalid doctor ID format." });
        }

        // Check if the doctor exists
        const doctorExists = await DoctorList.findById(doctorId);
        if (!doctorExists) {
            return res.status(404).json({ error: "Doctor not found." });
        }

        // Calculate T+1 date
        const tomorrowDate = new Date();
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            const tomorrowDateISO = tomorrowDate.toISOString().split('T')[0]; // Extract YYYY-MM-DD for tomorrow

        // Step 1: Fetch booked slots for the doctor on T+1 date
        const bookedSlots = await Booking.find(
            { doctorId, date: { $gte: tomorrowDateISO } }, // Only check future bookings
            { slotId: 1, _id: 0 } // Fetch only slotId
        ).lean();


         console.log(bookedSlots)

        // Fetch all slots for the doctor
        const allSlots = await Slot.find({ doctorId }, { time: 1 }).lean(); 

        if (bookedSlots.length === 0) {
            return res.status(200).json({
                availableSlots: allSlots.map(slot => ({
                    slotId: slot._id,  // Include slot ID
                    time: slot.time
                }))
            });
        }

        // Extract booked slot IDs
        const bookedSlotIds = bookedSlots.map(slot => slot.slotId.toString());

        // Filter out booked slots and include slotId
        const availableSlots = allSlots
            .filter(slot => !bookedSlotIds.includes(slot._id.toString()))
            .map(slot => ({
                slotId: slot._id,  // Include slot ID
                time: slot.time
            }));

        // Response
        return res.status(200).json({ availableSlots });

    } catch (error) {
        console.error("Error fetching slots:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



// Fetch all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await RegistrationForm.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch a single appointment by ID
exports.getAppointmentById = [appointmentUpdateValidationSchema, validateAppointmentUpdate, async (req, res) => {
    try {
        const appointment = await RegistrationForm.findById(req.params.id);
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}];

// Update an appointment by ID
exports.updateAppointment = [appointmentUpdateValidationSchema, validateAppointmentUpdate, async (req, res) => {
    const {email , status} = req.body
    console.log(email,status)
    try {
        const updatedAppointment = await RegistrationForm.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );
        if (!updatedAppointment) return res.status(404).json({ error: 'Appointment not found' });
        await updateMessage(email, status);
        res.status(200).json({ message: 'Appointment status updated successfully!', data: updatedAppointment });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}];

// Delete an appointment by ID
exports.deleteAppointment = [appointmentDeletionValidationSchema, validateAppointmentDeletion, async (req, res) => {
    try {
        const appointment = await RegistrationForm.findByIdAndDelete(req.params.id);
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
        res.status(200).json({ message: 'Appointment deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}];

