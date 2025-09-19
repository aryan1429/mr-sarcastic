# Google Cloud Console Setup Guide for Mr. Sarcastic

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"New Project"** or select an existing project
3. Enter project details:
   - **Project name**: `mr-sarcastic`
   - **Project ID**: `mr-sarcastic-[random-number]` (auto-generated)
4. Click **"Create"**
5. Wait for project creation to complete
6. **Note your Project ID** - you'll need this later

## Step 2: Enable Required APIs

1. In your project, go to **"APIs & Services" > "Library"**
2. Search for and enable these APIs:
   - **Google+ API** (for OAuth)
   - **Google Cloud Storage API**
   - **Identity and Access Management (IAM) API**

## Step 3: Set Up OAuth 2.0 Credentials

### 3.1 Create OAuth Client ID

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"+ CREATE CREDENTIALS" > "OAuth client ID"**
3. Choose **"Web application"**
4. Configure:
   - **Name**: `Mr Sarcastic Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:8080` (development)
     - Add your production domain later
   - **Authorized redirect URIs**:
     - Leave empty (not needed for Google Sign-In button)
5. Click **"Create"**
6. **Save your Client ID and Client Secret** - you'll need these!

### 3.2 Configure OAuth Consent Screen

1. Go to **"APIs & Services" > "OAuth consent screen"**
2. Choose **"External"** user type
3. Fill in app information:
   - **App name**: `Mr Sarcastic`
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **"Save and Continue"**
5. On Scopes page, click **"Save and Continue"**
6. On Test users page, add your email as a test user
7. Click **"Save and Continue"**

## Step 4: Create Service Account for Cloud Storage

### 4.1 Create Service Account

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"+ CREATE CREDENTIALS" > "Service account"**
3. Configure:
   - **Service account name**: `mr-sarcastic-storage`
   - **Service account ID**: `mr-sarcastic-storage` (auto-filled)
   - **Description**: `Service account for Cloud Storage operations`
4. Click **"Create and Continue"**

### 4.2 Grant Roles

1. On the **"Grant this service account access to project"** page:
   - **Role 1**: `Storage Admin`
   - **Role 2**: `Storage Object Admin`
2. Click **"Done"**

### 4.3 Generate Service Account Key

1. Click on your new service account (`mr-sarcastic-storage`)
2. Go to **"Keys"** tab
3. Click **"ADD KEY" > "Create new key"**
4. Choose **"JSON"** format
5. Click **"Create"**
6. **Download the JSON file** - keep it secure!

## Step 5: Create Cloud Storage Bucket

1. Go to **"Cloud Storage" > "Buckets"**
2. Click **"+ CREATE BUCKET"**
3. Configure bucket:
   - **Name**: `mr-sarcastic-user-data` (must be globally unique)
   - **Location**: Choose closest to your users (e.g., `us-central1`)
   - **Storage class**: `Standard`
   - **Access control**: `Uniform`
   - **Protection tools**: Enable as needed
4. Click **"Create"**

### 5.1 Configure Bucket Permissions

1. Click on your bucket (`mr-sarcastic-user-data`)
2. Go to **"Permissions"** tab
3. Click **"+ GRANT ACCESS"**
4. Add your service account:
   - **New principals**: `mr-sarcastic-storage@[project-id].iam.gserviceaccount.com`
   - **Role**: `Storage Object Admin`
5. Click **"Save"**

## Step 6: Update Environment Variables

### 6.1 Frontend Configuration

Update `frontend/.env`:
```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_from_step_3.1

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
```

### 6.2 Backend Configuration

Update `backend/.env`:
```env
# Google Cloud Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_from_step_3.1
GOOGLE_CLIENT_SECRET=your_actual_client_secret_from_step_3.1
GOOGLE_PROJECT_ID=your_project_id_from_step_1

# Google Cloud Storage
GCS_BUCKET_NAME=mr-sarcastic-user-data
GOOGLE_APPLICATION_CREDENTIALS=./mr-sarcastic-service-account-key.json

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8081
```

### 6.3 Place Service Account Key

1. Move your downloaded JSON key file to `backend/` folder
2. Rename it to `mr-sarcastic-service-account-key.json`
3. Update the path in `.env` if different

## Step 7: Test Your Setup

### 7.1 Start Backend Server

```bash
cd backend
npm run dev
```

### 7.2 Start Frontend Server

```bash
cd frontend
npm run dev
```

### 7.3 Test Authentication

1. Open `http://localhost:8081/login`
2. Click **"Sign in with Google"**
3. Complete OAuth flow
4. Check backend logs for success messages

### 7.4 Test Storage

1. Go to `http://localhost:8081/profile`
2. Upload a file to test Cloud Storage
3. Check your bucket in Google Cloud Console

## Step 8: Production Configuration

### 8.1 Update OAuth Settings

1. Go back to **"APIs & Services" > "Credentials"**
2. Click on your OAuth client ID
3. Add production domains:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: Add if needed

### 8.2 Update Environment Variables

For production, update:
- Use production API URLs
- Secure JWT secrets (generate a new one)
- Production Google Cloud credentials
- HTTPS URLs for CORS

## Troubleshooting

### Common Issues:

1. **"Invalid client" error**
   - Check Client ID in both frontend and backend
   - Verify OAuth consent screen is configured

2. **CORS errors**
   - Ensure FRONTEND_URL matches your frontend port
   - Check if backend is running on correct port

3. **Storage permission errors**
   - Verify service account has correct roles
   - Check bucket permissions
   - Ensure key file path is correct

4. **OAuth consent screen not showing**
   - Add your email as a test user
   - Publish the app for production use

### Debug Steps:

1. Check browser console for errors
2. Check backend server logs
3. Verify all environment variables are set
4. Test with Google OAuth playground

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use different service accounts for different environments**
3. **Regularly rotate service account keys**
4. **Enable billing alerts for cost control**
5. **Use signed URLs for file access**
6. **Implement proper input validation**

## Next Steps

1. **Test all features** (auth, file upload, profile management)
2. **Set up monitoring** (Google Cloud Monitoring)
3. **Configure backup** for your storage bucket
4. **Set up CI/CD** for automated deployment
5. **Add error tracking** (Sentry, etc.)

Your Google Cloud setup is now complete! 🎉
