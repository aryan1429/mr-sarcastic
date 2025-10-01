# Profile Update Implementation

## Overview
Successfully implemented user profile editing functionality that allows users to update their name and profile picture, with data stored in MongoDB.

## ⚠️ Important: Authentication Required

**To test the profile update functionality, users must be authenticated first:**

1. Navigate to `/auth` to log in (or any protected route will redirect there)
2. Use Google OAuth or Firebase authentication
3. Once authenticated, access `/profile` to test the new features

The 401 errors occur when trying to access protected endpoints without authentication. This is expected behavior.

## Backend Changes

### 1. Updated User Routes (`backend/routes/users.js`)

#### New Helper Function
- **`findUserByToken()`**: Universal user lookup function that works with all authentication providers (Google OAuth, Firebase, Email/Password)

#### New Endpoints
- **`PUT /api/users/me/picture`**: Upload and update profile picture
  - Accepts image files up to 5MB
  - Supports Google Cloud Storage (primary) with local storage fallback
  - Updates user's `picture` field in MongoDB
  
- **`GET /api/users/picture/:filename`**: Serve locally stored profile pictures

#### Enhanced Existing Endpoints
- **`GET /api/users/me`**: Now works with all authentication types
- **`PUT /api/users/me`**: Enhanced name updating with proper validation
- **`DELETE /api/users/me`**: Updated to work with all user types

### 2. Updated Dependencies (`backend/package.json`)
- Added `@google-cloud/storage` for cloud storage support
- `multer` was already available for file uploads

### 3. Enhanced Server Configuration (`backend/server.js`)
- Added static file serving for `/uploads` directory
- Profile pictures accessible via `/uploads/profile-pictures/` route

## Frontend Changes

### 1. Enhanced User Service (`frontend/src/services/api.js`)
- **`updateProfilePicture(file)`**: New method to upload profile pictures

### 2. Updated Profile Component (`frontend/src/pages/Profile.tsx`)

#### New Features
- **Profile Picture Upload**: Click the camera icon or upload button to change profile picture
- **Enhanced Settings Tab**: Better organized profile editing interface
- **Real-time Updates**: Profile changes reflect immediately in the UI

#### New State Management
- `uploadingProfilePic`: Tracks profile picture upload status
- Enhanced form validation for image files (type and size)

#### UI Improvements
- Profile picture upload button with camera icon
- Loading states for uploads
- Better organized settings tab with visual profile picture section

### 3. Enhanced AuthContext (`frontend/src/context/AuthContext.jsx`)
- **`updateUser()`**: New function to update user data across the app
- Ensures profile changes sync with authentication state

## Key Features

### 1. Universal Authentication Support
- Works with Google OAuth users
- Works with Firebase authentication users  
- Works with Email/Password users
- Seamless user lookup regardless of auth provider

### 2. Profile Picture Management
- **Upload Validation**: Only image files, max 5MB
- **Cloud Storage**: Primary storage via Google Cloud Storage
- **Local Fallback**: Automatic fallback to local storage if cloud unavailable
- **Dynamic URLs**: Profile pictures served with proper URLs

### 3. Name Updates
- **Real-time Updates**: Changes reflect immediately
- **MongoDB Storage**: Persisted in user document
- **Cross-app Sync**: Updates propagate to AuthContext

### 4. Error Handling
- File type validation
- File size validation
- Upload failure handling
- User-friendly error messages

## Database Schema
The existing User model already supported the required fields:
- `name`: String field for display name
- `picture`: String field for profile picture URL

## Troubleshooting

### 401 Unauthorized Errors
If you see 401 errors when accessing `/api/users/me` or other protected endpoints:

1. **Ensure user is authenticated**: Navigate to `/auth` and log in first
2. **Check token in localStorage**: The frontend stores JWT tokens in `localStorage.authToken`
3. **Verify API URL**: Frontend is configured to use `http://localhost:3001/api` (updated from 8001)

### Common Issues
- **Port conflicts**: Backend runs on 3001, frontend on 5173
- **Authentication flow**: All main routes are protected and require login
- **Environment variables**: Ensure `.env` files have correct API URLs

### Debug Steps
1. Open browser dev tools → Console to see authentication logs
2. Check Network tab for API requests and response codes
3. Verify localStorage contains `authToken` after login
4. Backend logs show authentication middleware activity

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update user name and preferences |
| PUT | `/api/users/me/picture` | Upload new profile picture |
| GET | `/api/users/picture/:filename` | Serve local profile pictures |

## Usage Instructions

### For Users
1. **Change Name**: Go to Profile → Settings tab → Update "Display Name" field
2. **Change Profile Picture**: 
   - Click the camera icon in the profile header, OR
   - Go to Settings tab → Click "Change Picture" button
   - Select an image file (max 5MB)
   - Picture updates automatically

### For Developers
- All changes are automatically synced with MongoDB
- Profile pictures are stored in Google Cloud Storage when available
- Local storage fallback ensures functionality without cloud setup
- AuthContext automatically updates with profile changes

## Error Handling
- Invalid file types show user-friendly error messages
- File size limits are enforced (5MB for profile pictures)
- Network errors are handled gracefully
- Upload failures provide clear feedback

## Storage Strategy
1. **Primary**: Google Cloud Storage (if configured)
2. **Fallback**: Local file system (`uploads/profile-pictures/`)
3. **Serving**: Static file server for local files, direct URLs for cloud files

## Security Considerations
- File type validation prevents non-image uploads
- File size limits prevent abuse
- Authentication required for all profile operations
- User-specific storage paths prevent unauthorized access