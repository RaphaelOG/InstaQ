#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Attendance = require('./models/Attendance');

const setupDatabase = async () => {
  try {
    console.log('🚀 Starting InstaQ Backend Setup...\n');

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/instaq';
    console.log(`📦 Connecting to MongoDB: ${mongoURI}`);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create default admin user
    console.log('👤 Creating default admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@instaq.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1234567890',
      address: '123 Church Street, City, State 12345'
    });
    console.log(`✅ Admin user created: ${adminUser.email} (password: admin123)\n`);

    // Create default staff user
    console.log('👥 Creating default staff user...');
    const staffUser = await User.create({
      name: 'Staff User',
      email: 'staff@instaq.com',
      password: 'staff123',
      role: 'staff',
      phone: '+1234567891',
      address: '456 Church Street, City, State 12345'
    });
    console.log(`✅ Staff user created: ${staffUser.email} (password: staff123)\n`);

    // Create sample attendance records
    console.log('📊 Creating sample attendance records...');
    const sampleAttendance = await Attendance.create({
      qrCodeData: {
        type: 'attendance',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        familyMembers: [
          {
            name: 'John Doe',
            age: 35,
            isChild: false,
            phone: '+1234567890',
            address: '123 Main St',
            emergencyContact: 'Jane Doe'
          },
          {
            name: 'Jane Doe',
            age: 32,
            isChild: false,
            phone: '+1234567891',
            address: '123 Main St',
            emergencyContact: 'John Doe'
          },
          {
            name: 'Baby Doe',
            age: 5,
            isChild: true
          }
        ]
      },
      scannedBy: adminUser._id,
      status: 'confirmed',
      notes: 'Sample attendance record for testing'
    });
    console.log(`✅ Sample attendance record created with ${sampleAttendance.totalMembers} family members\n`);

    // Display setup summary
    console.log('🎉 Setup completed successfully!\n');
    console.log('📋 Setup Summary:');
    console.log('├── Database: MongoDB connected');
    console.log('├── Admin User: admin@instaq.com (password: admin123)');
    console.log('├── Staff User: staff@instaq.com (password: staff123)');
    console.log('└── Sample Data: 1 attendance record created\n');

    console.log('🚀 Next Steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Test the API endpoints');
    console.log('3. Update the frontend API_BASE_URL to point to your backend');
    console.log('4. Change default passwords in production\n');

    console.log('🔗 API Endpoints:');
    console.log('├── Health Check: http://localhost:5000/health');
    console.log('├── API Base: http://localhost:5000/api');
    console.log('└── Documentation: See README.md\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase; 