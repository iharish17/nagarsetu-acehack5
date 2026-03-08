# NagarSetu - Civic Issue Reporting & Management Platform

NagarSetu is a comprehensive civic issue reporting and management platform that connects citizens, municipalities, and contractors to efficiently resolve urban infrastructure problems.

## Features

- **Citizen Portal**: Report civic issues with photos, location, and descriptions
- **Municipality Dashboard**: Verify, assign, and track issue resolution
- **Contractor Interface**: Manage assigned work orders and update resolution status
- **AI-Powered Chatbot**: Get instant assistance and guidance. Also it can submit issue by taking information and images from citizens and can track the reported issues, add categorize the issue and enhance the description.
- **Real-time Notifications**: Stay updated with OneSignal push notifications
- **Gamification**: Earn points for reporting and resolving issues
- **Email Verification**: Secure OTP-based email verification system

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- React Router for navigation
- Axios for API calls
- React Leaflet for maps
- React Hook Form with Zod validation
- OneSignal for push notifications

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for image storage
- Nodemailer for email services
- Google Gemini AI integration
- OneSignal for notifications

## Project Structure

```
nagarsetu-acehack5/
├── backend/              # Node.js backend server
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Custom middleware
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   └── services/    # Business logic services
│   └── package.json
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── api/        # API integration
│   │   ├── components/ # React components
│   │   ├── contexts/   # React contexts
│   │   ├── pages/      # Page components
│   │   └── types/      # TypeScript types
│   └── package.json
└── package.json         # Root workspace configuration
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/iharish17/nagarsetu-acehack5.git
cd nagarsetu-acehack5
```

2. **Install dependencies**
```bash
npm install
```

This will install dependencies for both frontend and backend.

3. **Environment Variables**

Create `.env` file in the `backend` directory:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# OneSignal
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_rest_api_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

Create `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id
```

4. **Run the application**

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Or run both from root:
```bash
npm run backend  # Terminal 1
npm run web      # Terminal 2
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/request-email-otp` - Request email verification OTP
- `POST /api/auth/verify-email-otp` - Verify email with OTP
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Issues
- `GET /api/issues` - Get all issues (with filters)
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get issue by ID
- `PUT /api/issues/:id/verify` - Verify issue (Municipality)
- `PUT /api/issues/:id/assign` - Assign issue to contractor
- `PUT /api/issues/:id/status` - Update issue status
- `PUT /api/issues/:id/resolve` - Submit resolution
- `PUT /api/issues/:id/approve` - Approve resolution

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/device-token` - Register device token

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

### AI Chatbot
- `POST /api/ai/chat` - Chat with AI assistant

## User Roles

### Citizen
- Report civic issues with photos and location
- Track issue status
- Earn points for reporting
- Receive notifications on issue updates

### Municipality
- View and verify reported issues
- Assign issues to contractors
- Approve resolutions
- Monitor overall progress

### Contractor
- View assigned work orders
- Update work status
- Submit resolution with proof
- Earn points for completed work

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Contact

For any queries or support, please reach out to the development team.

---

Built with ❤️ for AceHack 5.0
