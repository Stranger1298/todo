const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const User = require('../models/User');

async function viewUsers() {
    try {
        // Get all users
        const users = await User.find({}, '-password'); // Exclude password field for security
        console.log('\n=== Users in Database ===');
        console.log('Total Users:', users.length);
        users.forEach(user => {
            console.log('\nUser Details:');
            console.log('ID:', user._id);
            console.log('Name:', user.name);
            console.log('Email:', user.email);
            console.log('Created:', user.createdAt);
            console.log('Updated:', user.updatedAt);
            console.log('------------------------');
        });

        mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error viewing users:', error);
        mongoose.connection.close();
    }
}

viewUsers();
