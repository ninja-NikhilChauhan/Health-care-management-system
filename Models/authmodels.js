const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// Define the User Schema with Validation
const authSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'], 
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
        lowercase: true, 
        trim: true, 
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'], 
        minlength: [6, 'Password must be at least 6 characters long']
    }
}, { timestamps: true });

// Pre-save hook to hash the password before saving
authSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Create a User Model
const User = mongoose.model('Auth', authSchema);
module.exports = User; // Export the User model
