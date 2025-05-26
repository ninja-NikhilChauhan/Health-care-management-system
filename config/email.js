const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: 'apikey', 
        pass: process.env.SENDGRID_PASSWORD 
    }
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.SENDER_EMAIL, // Ensure this is a verified sender in SendGrid
        to,
        subject,
        text
    };
    
    await transporter.sendMail(mailOptions);
};

const sendOTP = async (email, otp) => {
    await sendEmail(email, "Admin Login OTP", `Your one-time login code is: ${otp}. It will expire in 5 minutes.`);
};

const updateMessage = async (email, status) => {
    const message = status === 'Accepted' 
        ? `Your appointment has been accepted. Please make sure you are available for the appointed time.`
        : `Your appointment has been rejected. We apologize for the inconvenience.`;
    
    await sendEmail(email, "Booking Update", message);
};

const signupMessage = async (email, name) => {
    await sendEmail(email, "Welcome to Our Service", `Hello ${name},\n\nThank you for signing up! We're glad to have you on board.\n\nBest regards,\nYour Hospital Name`);
};

module.exports = { sendOTP, updateMessage, signupMessage };
