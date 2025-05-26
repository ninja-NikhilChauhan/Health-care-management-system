const mongoose = require('mongoose');

// Define the Schema with Validation
const doctorListSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'], 
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long']
    },
    specialty: { 
        type: String, 
        required: [true, 'Specialty is required'], 
        trim: true 
    },
    phonenumber: { 
        type: String, 
        required: [true, 'Phone number is required'], 
        match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
    },
    dateOfBirth: { 
        type: Date, 
        required: [true, 'Date of Birth is required'], 
        validate: {
            validator: function(value) {
                return value < new Date(); // DOB should be in the past
            },
            message: 'Date of Birth cannot be in the future'
        }
    },
    address: { 
        type: String, 
        required: [true, 'Address is required'], 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
        lowercase: true, 
        trim: true, 
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    availability: { 
        type: [String], 
        required: [true, 'Availability is required'], 
        enum: ['Morning', 'Afternoon', 'Evening', 'FullDay'], 
        default: 'Full Day' 
    },
    degree: { 
        type: String, 
        required: [true, 'Degree is required'], 
        trim: true 
    },

}, { timestamps: true });

// Create the Model
const DoctorList = mongoose.model('DoctorList', doctorListSchema);
module.exports = DoctorList; // Export the model
