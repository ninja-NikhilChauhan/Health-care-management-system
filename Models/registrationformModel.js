// models/registrationformModel.js
const mongoose = require('mongoose');

// Define the User Schema
const registrationFormSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'], 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    phonenumber: { 
        type: String,
        required: [true, 'Phone number is required'], 
        trim: true,
        match: [/^\d{10,15}$/, 'Phone number must be between 10 to 15 digits']
    },
    dateOfBirth: { 
        type: Date, 
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function (value) {
                return value < new Date();
            },
            message: 'Date of birth must be a past date'
        }
    },
    address: { 
        type: String, 
        required: [true, 'Address is required'], 
        trim: true 
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'], 
        trim: true 
    },
    doctorname: { 
        type: String, 
        required: [true, 'Doctor name is required'], 
        trim: true 
    },
    slotTime: { 
        type: String, 
        required: [true, 'Slot time is required'], 
        trim: true 
    },
    bookingDate: { 
        type: Date, 
        required: [true, 'Booking date is required']
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Rejected'], 
        default: 'Pending', 
        required: true 
    },
    medicalDocumentUrl: {
        type: String,
        required: false
    }
}, { timestamps: true });

// Create a Model
const RegistrationForm = mongoose.model('RegistrationForm', registrationFormSchema);
module.exports = RegistrationForm;