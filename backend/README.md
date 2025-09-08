# Mr. Sarcastic - Google Cloud Authentication & Storage Integration

## Overview

This project now includes Google Cloud authentication and storage integration with the following features:

### ✅ Authentication
- **Google OAuth 2.0** integration for secure user login
- **JWT tokens** for session management
- **Automatic token refresh** to maintain user sessions
- **Protected routes** requiring authentication

### ✅ User Data Storage
- **Google Cloud Storage** for persistent user data
- **Profile management** with customizable preferences
- **Secure file uploads** with user-specific folders
- **Graceful degradation** when storage is not configured

### ✅ Security Features
- **CORS protection** with configurable origins
- **Rate limiting** to prevent abuse
- **Input validation** and error handling
- **Secure file handling** with type restrictions

## Current Status

### ✅ Working Features
1. **Backend API Server** - Running on port 3001
2. **Google OAuth Integration** - Login flow implemented
3. **User Profile Management** - Create/read/update profiles
4. **File Upload System** - Secure file handling
5. **JWT Authentication** - Token-based sessions
6. **Protected Routes** - Authentication required pages
7. **Graceful Degradation** - Works without Google Cloud config

### 🔧 Setup Required
To fully activate all features, you need to:

1. **Create Google Cloud Project**
2. **Configure OAuth 2.0 credentials**
3. **Set up Google Cloud Storage bucket**
4. **Create service account with storage permissions**
5. **Update environment variables**

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Google Cloud credentials
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Google Client ID
npm run dev
```

### 3. Test the Application
1. Visit `http://localhost:5173`
2. Navigate to Login page
3. Try Google Sign-In (will show placeholder message until configured)
4. Visit Profile page to test protected routes

## Configuration Steps

For detailed setup instructions, see:
- `backend/GOOGLE_CLOUD_SETUP.md` - Complete configuration guide

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `DELETE /api/users/me` - Delete user account

### File Storage
- `POST /api/storage/upload` - Upload files
- `GET /api/storage/files` - List user files
- `DELETE /api/storage/files/:fileName` - Delete files

The authentication and storage foundation is now ready for your application!
