# Google Cloud Console Setup Steps

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Click "New Project"** (top left corner)
3. **Project Details**:
   - **Project name**: `mr-sarcastic`
   - **Project ID**: Leave as auto-generated (e.g., `mr-sarcastic-123456`)
4. **Click "Create"**
5. **Wait** for project creation (takes ~30 seconds)
6. **Note your Project ID** - you'll need this later!

## Step 2: Enable Required APIs

1. **In your project dashboard**, click **"APIs & Services"** → **"Library"**
2. **Search and enable these APIs** (one by one):
   - Search: `Google+ API` → Click → **"Enable"**
   - Search: `Google Cloud Storage` → Click → **"Enable"**
   - Search: `Identity and Access Management (IAM) API` → Click → **"Enable"**

## Step 3: Configure OAuth Consent Screen

1. **Go to**: **"APIs & Services"** → **"OAuth consent screen"**
2. **Choose User Type**: **"External"**
3. **App Information**:
   - **App name**: `Mr Sarcastic`
   - **User support email**: Select your email
   - **App logo**: (optional) Upload your app logo
   - **App domain**: (leave empty for now)
4. **Developer contact information**: Enter your email
5. **Click "Save and Continue"**

6. **Scopes page**: Click **"Save and Continue"** (we don't need additional scopes)

7. **Test users page**:
   - Click **"+ ADD USERS"**
   - Enter your Google email address
   - Click **"Add"**
   - Click **"Save and Continue"**

## Step 4: Create OAuth 2.0 Credentials

1. **Go to**: **"APIs & Services"** → **"Credentials"**
2. **Click "+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. **Application type**: **"Web application"**
4. **Name**: `Mr Sarcastic Web Client`
5. **Authorized JavaScript origins**:
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:8081`
   - **Note**: This is your frontend development URL
6. **Authorized redirect URIs**: Leave empty (not needed for Google Sign-In button)
7. **Click "Create"**

8. **⚠️ IMPORTANT**: Save these values immediately!
   - **Client ID**: Copy this long string
   - **Client Secret**: Copy this secret string

## Step 5: Create Service Account for Storage

1. **In Credentials page**, click **"+ CREATE CREDENTIALS"** → **"Service account"**
2. **Service account details**:
   - **Service account name**: `mr-sarcastic-storage`
   - **Service account ID**: Auto-filled
   - **Description**: `Service account for Cloud Storage operations`
3. **Click "Create and Continue"**

4. **Grant this service account access to project**:
   - **Role 1**: Click "Role" → Search `Storage Admin` → Select
   - **Role 2**: Click "+ ADD ANOTHER ROLE" → Search `Storage Object Admin` → Select
5. **Click "Done"**

## Step 6: Generate Service Account Key

1. **Click on your service account**: `mr-sarcastic-storage`
2. **Go to "Keys" tab**
3. **Click "ADD KEY"** → **"Create new key"**
4. **Key type**: **"JSON"**
5. **Click "Create"**
6. **⚠️ IMPORTANT**: Download the JSON file and keep it secure!

## Step 7: Create Cloud Storage Bucket

1. **Go to**: **"Cloud Storage"** → **"Buckets"**
2. **Click "+ CREATE BUCKET"**
3. **Bucket details**:
   - **Name**: `mr-sarcastic-user-data` (must be globally unique!)
   - **Location type**: `Region`
   - **Location**: Choose closest to you (e.g., `us-central1`)
   - **Storage class**: `Standard`
   - **Access control**: `Uniform`
4. **Click "Create"**

## Step 8: Configure Bucket Permissions

1. **Click on your bucket**: `mr-sarcastic-user-data`
2. **Go to "Permissions" tab**
3. **Click "+ GRANT ACCESS"**
4. **Add principal**:
   - **New principals**: `mr-sarcastic-storage@[YOUR-PROJECT-ID].iam.gserviceaccount.com`
   - **Role**: `Storage Object Admin`
5. **Click "Save"**

## Step 9: Update Your Application Files

### Frontend Configuration (frontend/.env)
Replace the placeholder with your actual Client ID:
```env
VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
```

### Backend Configuration (backend/.env)
Replace all placeholders with your actual values:
```env
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET_HERE
GOOGLE_PROJECT_ID=YOUR_PROJECT_ID_HERE
GCS_BUCKET_NAME=mr-sarcastic-user-data
GOOGLE_APPLICATION_CREDENTIALS=./mr-sarcastic-service-account-key.json
```

### Place Service Account Key
1. **Move the downloaded JSON file** to your `backend/` folder
2. **Rename it** to `mr-sarcastic-service-account-key.json`

## Step 10: Test Your Setup

1. **Start backend**: `cd backend && npm run dev`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Test login**: Go to `http://localhost:8081/login`
4. **Click "Sign in with Google"**
5. **Complete OAuth flow**
6. **Check backend logs** for success messages

## Quick Reference - What You Need

After completing the steps above, you'll have:

- ✅ **Project ID**: From Step 1
- ✅ **Client ID**: From Step 4
- ✅ **Client Secret**: From Step 4
- ✅ **Service Account JSON Key**: From Step 6
- ✅ **Storage Bucket**: From Step 7

## Troubleshooting

### If you get "Invalid client" error:
- Double-check your Client ID in both frontend and backend .env files
- Make sure OAuth consent screen is properly configured

### If you get CORS errors:
- Verify FRONTEND_URL in backend/.env matches your frontend port (8081)
- Check that backend is running on port 3001

### If storage doesn't work:
- Verify service account has the correct roles
- Check that the JSON key file is in the correct location
- Ensure bucket permissions are set correctly

## Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check backend server logs
3. Verify all environment variables are set correctly
4. Make sure all APIs are enabled

Your Google Cloud setup is ready! 🚀
