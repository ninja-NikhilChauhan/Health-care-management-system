const mongoose = require("mongoose");

const AdminAuthSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
        lowercase: true, 
        trim: true, 
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    name: { 
        type: String, 
        required: [true, 'Name is required'], 
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long']
    },
    otp: { 
        type: String, 
        minlength: [4, 'OTP must be at least 4 characters long'],
        maxlength: [6, 'OTP cannot exceed 6 characters']
    },
    otpexpiry: { 
        type: Date 
    }
}, { timestamps: true }); // This will automatically add createdAt & updatedAt

const AdminAuth = mongoose.model('AdminAuth', AdminAuthSchema);
module.exports = AdminAuth;
