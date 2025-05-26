require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const { initSocket } = require('./socket'); // Import the socket initialization function

// Import routes
const authRoutes = require('./Routes/authroutes');
const formRoute = require('./Routes/registrationformRoute');
const doctorlistRoutes = require("./Routes/doctorlistRoutes");
const adminlogin = require('./Routes/adminAuthRoutes');

const uploadRoute = require('./routes/uploadRoutes.js');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO using the socket module
const io = initSocket(server);

// Middleware
app.use(express.json());
app.use(cors());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api', uploadRoute)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin-dashboard', 'adminDashboard.html'));
});
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'chat.html'));
});
app.get('/admin-chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin-dashboard', 'admin-chat.html'));
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/form', formRoute);
app.use('/api/adminauth', adminlogin);
app.use('/api/admin/doctorlist', doctorlistRoutes);
app.use('/api/doctorlist', doctorlistRoutes);

// Add this with your other app.use statements
// app.use('/api/upload', uploadRoutes);

// MongoDB + Server Init
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});


