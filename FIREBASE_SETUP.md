# Firebase Setup for TaskDefender

This document provides instructions for setting up Firebase for the TaskDefender application.

## Prerequisites

1. A Firebase account
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. Social media API credentials (optional, for social media integration)

## Setup Steps

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the steps to create a new project
4. Enable Google Analytics if desired

### 2. Set Up Firebase Authentication

1. In the Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" authentication
4. Configure email verification settings as needed

### 3. Set Up Firestore Database

1. In the Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location for your database

### 4. Set Up Firebase Storage

1. In the Firebase Console, go to "Storage"
2. Click "Get started"
3. Follow the setup steps

### 5. Deploy Firestore Security Rules

1. Copy the contents of `firestore.rules` from this project
2. In the Firebase Console, go to "Firestore Database" > "Rules"
3. Paste the rules and click "Publish"

### 6. Deploy Storage Rules

1. Copy the contents of `storage.rules` from this project
2. In the Firebase Console, go to "Storage" > "Rules"
3. Paste the rules and click "Publish"

### 7. Set Up Firebase Functions (for Social Media Integration)

1. In the Firebase Console, go to "Functions"
2. Click "Get started" if you haven't used Functions before
3. Deploy the functions from this project using the Firebase CLI:
   ```
   firebase deploy --only functions
   ```

### 8. Configure Social Media API Credentials

To enable social media integration, you need to set up API credentials for each platform:

#### Twitter
1. Create a Twitter Developer account and create an app
2. Get your API key, API secret, and Bearer token
3. Set the Firebase Functions config:
   ```
   firebase functions:config:set social.twitter.api_key="YOUR_API_KEY" social.twitter.api_secret="YOUR_API_SECRET" social.twitter.bearer_token="YOUR_BEARER_TOKEN"
   ```

#### LinkedIn
1. Create a LinkedIn Developer account and create an app
2. Get your Bearer token
3. Set the Firebase Functions config:
   ```
   firebase functions:config:set social.linkedin.bearer_token="YOUR_BEARER_TOKEN"
   ```

#### Facebook
1. Create a Facebook Developer account and create an app
2. Get your Bearer token
3. Set the Firebase Functions config:
   ```
   firebase functions:config:set social.facebook.bearer_token="YOUR_BEARER_TOKEN"
   ```

#### Dev.to
1. Create a Dev.to account and get your API key
2. Set the Firebase Functions config:
   ```
   firebase functions:config:set social.devto.bearer_token="YOUR_API_KEY"
   ```

### 9. Update Environment Variables

1. Copy the Firebase configuration from your project settings
2. Update the `.env` file in the project root with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

## Troubleshooting

### Missing or Insufficient Permissions

If you see "Missing or insufficient permissions" errors:

1. Check that your Firestore security rules are properly configured
2. Ensure that the user is authenticated before accessing protected resources
3. Verify that the user has the correct permissions for the operation

### Social Media Integration Issues

If social media integration is not working:

1. Check that you've set the correct API credentials in Firebase Functions config
2. Verify that the API credentials have the necessary permissions
3. Check the Firebase Functions logs for specific error messages