# Google Cloud Authentication & Storage Setup Guide

This guide will help you set up Google Cloud authentication and storage for the Mr. Sarcastic application.

## Prerequisites

1. Google Cloud Platform account
2. Node.js installed
3. Frontend and backend applications ready

## Step 1: Google Cloud Project Setup

### 1.1 Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select an existing project
3. Note your Project ID for later use

### 1.2 Enable Required APIs
Enable the following APIs in your Google Cloud project:
1. Google+ API (for OAuth)
2. Google Cloud Storage API
3. Identity and Access Management (IAM) API

```bash
# Using gcloud CLI (optional)
gcloud services enable plus.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable iam.googleapis.com
```

## Step 2: OAuth 2.0 Setup

### 2.1 Create OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: Mr Sarcastic Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (development)
     - Your production domain
   - **Authorized redirect URIs**:
     - `http://localhost:5173` (development)
     - Your production domain

5. Save the **Client ID** and **Client Secret**

### 2.2 Create Service Account
1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > Service account**
3. Configure:
   - **Service account name**: mr-sarcastic-storage
   - **Description**: Service account for storage operations
4. Click **Create and Continue**
5. Grant the following roles:
   - **Storage Admin**
   - **Storage Object Admin**
6. Click **Done**

### 2.3 Generate Service Account Key
1. Click on the created service account
2. Go to **Keys** tab
3. Click **ADD KEY > Create new key**
4. Choose **JSON** format
5. Download the key file and save it securely

## Step 3: Google Cloud Storage Setup

### 3.1 Create Storage Bucket
1. Go to **Cloud Storage > Buckets**
2. Click **+ CREATE BUCKET**
3. Configure:
   - **Name**: `mr-sarcastic-user-data` (must be globally unique)
   - **Location**: Choose based on your users' location
   - **Storage class**: Standard
   - **Access control**: Uniform
4. Click **CREATE**

### 3.2 Configure Bucket Permissions
1. Select your bucket
2. Go to **Permissions** tab
3. Add your service account with **Storage Object Admin** role

## Step 4: Backend Configuration

### 4.1 Install Dependencies
```bash
cd backend
npm install
```

### 4.2 Environment Configuration
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your values:
```env
# Google Cloud Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_PROJECT_ID=your_google_project_id_here

# Google Cloud Storage
GCS_BUCKET_NAME=mr-sarcastic-user-data
GOOGLE_APPLICATION_CREDENTIALS=./path/to/your/service-account-key.json

# JWT Configuration
JWT_SECRET=your_very_long_and_random_jwt_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 4.3 Place Service Account Key
1. Copy your downloaded service account JSON key to the backend folder
2. Update the `GOOGLE_APPLICATION_CREDENTIALS` path in `.env`

### 4.4 Start Backend Server
```bash
npm run dev
```

## Step 5: Frontend Configuration

### 5.1 Install Dependencies
```bash
cd frontend
npm install
```

### 5.2 Environment Configuration
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your values:
```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
```

### 5.3 Start Frontend Server
```bash
npm run dev
```

## Step 6: Testing the Integration

### 6.1 Test Authentication
1. Navigate to `http://localhost:5173/login`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify you're redirected and logged in

### 6.2 Test File Upload
1. Go to Profile page
2. Navigate to Files tab
3. Upload a test file
4. Check Google Cloud Storage bucket for the uploaded file

### 6.3 Test User Data Storage
1. Update profile information
2. Check if data persists after refresh
3. Verify data is stored in Google Cloud Storage

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### User Management
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile
- `DELETE /api/users/me` - Delete user account

### File Storage
- `POST /api/storage/upload` - Upload file
- `GET /api/storage/files` - List user files
- `GET /api/storage/files/:fileName/url` - Get signed URL
- `DELETE /api/storage/files/:fileName` - Delete file
- `POST /api/storage/data/:key` - Save user data
- `GET /api/storage/data/:key` - Get user data

## Troubleshooting

### Common Issues

1. **"Access denied" errors**
   - Check service account permissions
   - Verify bucket permissions
   - Ensure GOOGLE_APPLICATION_CREDENTIALS path is correct

2. **CORS errors**
   - Verify FRONTEND_URL in backend .env
   - Check OAuth authorized origins

3. **Token errors**
   - Verify JWT_SECRET is set
   - Check Google Client ID/Secret

4. **File upload failures**
   - Check bucket permissions
   - Verify service account has Storage Admin role
   - Ensure bucket name is correct

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use different service accounts for different environments**
3. **Regularly rotate service account keys**
4. **Implement proper input validation**
5. **Use signed URLs for file access**
6. **Enable audit logging**
