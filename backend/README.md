# InstaQ Backend API

A Node.js/Express backend API for the InstaQ Church Attendance App with QR code scanning functionality.

## Features

- 🔐 JWT Authentication & Authorization
- 📊 QR Code Attendance Logging
- 👨‍👩‍👧‍👦 Family Member Management
- 📈 Attendance Statistics & Analytics
- 🛡️ Security Middleware (Helmet, CORS, Rate Limiting)
- 📝 Input Validation & Error Handling
- 🗄️ MongoDB Database with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, cors
- **Validation**: express-validator
- **Logging**: morgan

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Database Setup**
   - Ensure MongoDB is running locally or update the MONGODB_URI in .env
   - For production, use MongoDB Atlas or your preferred cloud provider

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file in the backend directory:

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

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| PUT | `/api/auth/password` | Change password | Private |
| POST | `/api/auth/logout` | Logout user | Private |

### Attendance

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/attendance/scan` | Log attendance from QR scan | Private (Staff/Admin) |
| GET | `/api/attendance` | Get all attendance records | Private (Staff/Admin) |
| GET | `/api/attendance/stats` | Get attendance statistics | Private (Staff/Admin) |
| GET | `/api/attendance/:id` | Get attendance by ID | Private (Staff/Admin) |
| PUT | `/api/attendance/:id/status` | Update attendance status | Private (Admin) |
| DELETE | `/api/attendance/:id` | Delete attendance record | Private (Admin) |

### Family Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/family` | Get family members | Private |
| POST | `/api/family` | Add family member | Private |
| PUT | `/api/family/:id` | Update family member | Private |
| DELETE | `/api/family/:id` | Delete family member | Private |

## QR Code Data Format

The QR code should contain JSON data in the following format:

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

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Please include a valid email"
    }
  ]
}
```

## Database Models

### User Model
- Authentication fields (email, password)
- Profile information (name, phone, address)
- Role-based access control
- Account status and last login tracking

### Attendance Model
- QR code data storage
- Scanner information
- Location tracking
- Status management (pending, confirmed, rejected)
- Virtual fields for statistics

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication without server-side sessions
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express applications
- **Environment Variables**: Secure configuration management

## Development

### Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Run tests
npm test
```

### Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── errorHandler.js     # Error handling middleware
├── models/
│   ├── Attendance.js       # Attendance data model
│   └── User.js            # User model
├── routes/
│   ├── attendance.js       # Attendance endpoints
│   ├── auth.js            # Authentication endpoints
│   └── family.js          # Family management endpoints
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use production MongoDB URI
   - Set strong JWT secret
   - Configure CORS origins

2. **Security Considerations**
   - Use HTTPS in production
   - Implement proper logging
   - Set up monitoring and alerts
   - Regular security updates

3. **Performance Optimization**
   - Enable database indexing
   - Implement caching strategies
   - Use compression middleware
   - Monitor API performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 