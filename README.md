# InstaQ - Church Attendance App

A modern React Native mobile application with Node.js backend for church attendance management using QR codes.

## 🚀 Features

### Frontend (React Native)
- 📱 Modern, intuitive mobile interface
- 📷 QR Code scanning and generation
- 👨‍👩‍👧‍👦 Family member management
- 📊 Real-time attendance tracking
- 🎨 Beautiful, responsive UI design
- 🔐 Secure authentication integration

### Backend (Node.js/Express)
- 🔐 JWT Authentication & Authorization
- 📊 QR Code attendance logging
- 👨‍👩‍👧‍👦 Family member management
- 📈 Attendance statistics & analytics
- 🛡️ Security middleware (Helmet, CORS, Rate Limiting)
- 📝 Input validation & error handling
- 🗄️ MongoDB database with Mongoose ODM

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **Icons**: Expo Vector Icons
- **QR Code**: react-native-qrcode-svg
- **UI**: Custom styled components

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, cors
- **Validation**: express-validator
- **Logging**: morgan

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Expo CLI (for mobile development)
- iOS Simulator or Android Emulator (for testing)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd InstaQ
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your configuration
# (See Environment Variables section below)

# Run database setup (creates default users and sample data)
npm run setup

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate back to root directory
cd ..

# Install dependencies
npm install

# Start Expo development server
npm start
```

### 4. Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/instaq
MONGODB_URI_PROD=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/instaq

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,exp://localhost:19000

# Logging
LOG_LEVEL=info
```

### 5. Update Frontend API Configuration

In `screens/HomeScreen.js`, update the API_BASE_URL:

```javascript
const API_BASE_URL = 'http://localhost:5000/api'; // Change to your backend URL
```

## 📱 Mobile App Usage

### Default Users (Created by Setup Script)

- **Admin User**: admin@instaq.com (password: admin123)
- **Staff User**: staff@instaq.com (password: staff123)

### Features

1. **QR Code Scanning**: Scan QR codes to log attendance
2. **QR Code Generation**: Generate QR codes for family attendance
3. **Family Management**: Add, edit, and remove family members
4. **Attendance Tracking**: View and manage attendance records
5. **Real-time Updates**: See attendance statistics and recent activities

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/logout` - Logout user

### Attendance
- `POST /api/attendance/scan` - Log attendance from QR scan
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/stats` - Get attendance statistics
- `GET /api/attendance/:id` - Get attendance by ID
- `PUT /api/attendance/:id/status` - Update attendance status
- `DELETE /api/attendance/:id` - Delete attendance record

### Family Management
- `GET /api/family` - Get family members
- `POST /api/family` - Add family member
- `PUT /api/family/:id` - Update family member
- `DELETE /api/family/:id` - Delete family member

## 📊 QR Code Data Format

The QR code contains JSON data in this format:

```json
{
  "type": "attendance",
  "date": "2024-01-15",
  "time": "10:30:00 AM",
  "familyMembers": [
    {
      "name": "John Doe",
      "age": 35,
      "isChild": false,
      "phone": "+1234567890",
      "address": "123 Main St",
      "emergencyContact": "Jane Doe"
    },
    {
      "name": "Baby Doe",
      "age": 5,
      "isChild": true
    }
  ]
}
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🏗️ Project Structure

```
InstaQ/
├── backend/                 # Node.js/Express backend
│   ├── config/
│   │   └── database.js     # Database configuration
│   │   └── .env            # Environment variables
│   │   └── middleware/
│   │   └── models/
│   │   └── routes/
│   │   └── server.js       # Main server file
│   │   └── setup.js        # Database setup script
│   │   └── package.json    # Backend dependencies
│   │   └── README.md       # Backend documentation
├── screens/                 # React Native screens
│   ├── HomeScreen.js       # Main home screen
│   ├── LoginScreen.js      # Login screen
│   ├── SignupScreen.js     # Signup screen
│   └── ...                 # Other screens
├── assets/                  # App assets
├── App.js                   # Main app component
├── package.json            # Frontend dependencies
└── README.md               # This file
```

## 🚀 Development

### Backend Development

```bash
cd backend

# Start development server with nodemon
npm run dev

# Run tests
npm test

# Setup database with sample data
npm run setup
```

### Frontend Development

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## 🔧 Configuration

### Database Setup

1. **Local MongoDB**: Install and start MongoDB locally
2. **MongoDB Atlas**: Use cloud MongoDB service
3. **Update MONGODB_URI**: Set the connection string in `.env`

### CORS Configuration

Update `ALLOWED_ORIGINS` in `.env` to include your frontend URLs:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,exp://localhost:19000
```

### Production Deployment

1. **Environment Variables**: Set `NODE_ENV=production`
2. **Database**: Use production MongoDB URI
3. **Security**: Change default passwords and JWT secret
4. **CORS**: Configure allowed origins for production domains
5. **HTTPS**: Use HTTPS in production

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@instaq.com","password":"admin123"}'
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Ensure MongoDB is running and connection string is correct
2. **CORS Error**: Check `ALLOWED_ORIGINS` configuration
3. **JWT Token Error**: Verify JWT secret is set correctly
4. **Port Already in Use**: Change PORT in `.env` or kill existing process

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in `.env`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community for the excellent framework
- Expo team for the development tools
- MongoDB team for the database
- Express.js team for the web framework

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in `/backend/README.md`
- Review the API documentation above

---

**InstaQ** - Making church attendance tracking simple and efficient! 🏛️✨ 

## Authentication Flow

The app now has a complete authentication system with the following features:

### Login Flow
1. **Login Screen** (`screens/LoginScreen.js`)
   - Connects to backend `/api/auth/login` endpoint
   - Stores JWT token and user data securely using AsyncStorage
   - Shows loading state during authentication
   - Handles network errors gracefully

2. **Signup Screen** (`screens/SignupScreen.js`)
   - Connects to backend `/api/auth/register` endpoint
   - Validates password length (minimum 6 characters)
   - Stores JWT token and user data after successful registration
   - Shows loading state during registration

3. **Profile Screen** (`screens/ProfileScreen.js`)
   - Displays user information (name, email, username)
   - Provides logout functionality
   - Clears stored authentication data on logout

4. **Home Screen** (`screens/HomeScreen.js`)
   - Automatically loads user token from storage
   - Uses real JWT token for all API requests
   - Loads family members on app start

### Authentication Utilities (`utils/auth.js`)
- Centralized authentication functions
- Secure token and user data storage
- Helper functions for API requests with auth headers

### App Startup (`App.js`)
- Checks for existing authentication on app launch
- Automatically redirects to main app if user is logged in
- Shows loading screen during authentication check

## Testing the Authentication Flow

### Prerequisites
1. Make sure your backend is running on port 5001
2. Update the API_BASE_URL in all screens to match your computer's IP address
3. Ensure you have a test user in your MongoDB database

### Test Steps

1. **Start the app**
   ```bash
   npm start
   ```

2. **Test Registration**
   - Navigate to Signup screen
   - Fill in all fields (email, full name, username, password)
   - Submit the form
   - You should see a success message and be redirected to the main app

3. **Test Login**
   - Logout from the Profile screen
   - Navigate to Login screen
   - Enter the credentials you just created
   - You should be redirected to the main app

4. **Test Protected Features**
   - Try adding family members (should work with real token)
   - Try scanning QR codes (should work with real token)
   - Check that the Profile screen shows your user information

5. **Test Logout**
   - Go to Profile screen
   - Tap the logout button
   - Confirm logout
   - You should be redirected to the landing screen

### API Configuration

Make sure your backend is running and accessible. The app uses these endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/family` - Get family members (requires auth)
- `POST /api/family` - Add family member (requires auth)
- `DELETE /api/family/:id` - Remove family member (requires auth)
- `POST /api/attendance/scan` - Log attendance (requires auth)

### Troubleshooting

1. **Network Error**: Make sure your backend is running and the IP address is correct
2. **401 Unauthorized**: The token might be invalid or expired. Try logging out and logging back in
3. **Token not found**: Clear the app data or reinstall the app

### Security Features

- JWT tokens are stored securely using AsyncStorage
- All authenticated API requests include the Authorization header
- Tokens are automatically cleared on logout
- App checks authentication status on startup

## File Structure

```
screens/
├── LoginScreen.js      # Login with backend integration
├── SignupScreen.js     # Registration with backend integration
├── HomeScreen.js       # Main app with real token usage
├── ProfileScreen.js    # User profile with logout
└── ...

utils/
└── auth.js            # Authentication utilities

App.js                 # App startup with auth check
```

The authentication system is now fully integrated with your backend and should resolve the token issues you were experiencing! 