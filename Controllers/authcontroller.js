const User = require('../Models/authmodels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { signupMessage } = require("../config/email");
const { check, validationResult } = require('express-validator'); // Import express-validator for route validation

// Secret key for JWT
const SECRET_KEY = process.env.JWT_SECRET;

// User Signup Controller with validation
const signup = async (req, res) => {
    try {
        console.log("start")
        const { name, email, password } = req.body;
        console.log("after req body")

        // Validation for signup route
        await check('name', 'Name is required').not().isEmpty().run(req);
        await check('name', 'Name must be at least 3 characters long').isLength({ min: 3 }).run(req);
        await check('email', 'Email is required').not().isEmpty().run(req);
        await check('email', 'Please enter a valid email').isEmail().run(req);
        await check('password', 'Password is required').not().isEmpty().run(req);
        await check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }).run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log("after validation")


        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash password before saving
        // const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password });
        await newUser.save();
        await signupMessage(email,name)
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};

// User Signin Controller with validation
const signin = async (req, res) => {
    try {
        // Validation for signin route
        await check('email', 'Email is required').not().isEmpty().run(req);
        await check('email', 'Please enter a valid email').isEmail().run(req);
        await check('password', 'Password is required').not().isEmpty().run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        console.log("Received Body:", req.body);

        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all the required fields!" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("userfound",user)
        console.log("Comparing password:", password, "with hash:", user.password);
        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(password.toString(), user.password);
        console.log("Password comparison result:", isPasswordValid);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        console.log("password match")

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
        console.log("token generated")

        res.status(200).json({ message: "Login successful", token  ,userId:user._id });
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = { signup, signin };
