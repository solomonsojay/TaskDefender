# Firestore Security Rules Update Required

Your current Firestore rules are blocking all operations. You need to update them in the Firebase Console to allow authenticated users to access their data.

## Current Rules (Blocking Everything):
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Updated Rules (Required):
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow users to read and write their own focus sessions
    match /focusSessions/{sessionId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow team members to read and write team documents they belong to
    match /teams/{teamId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members[].userId;
      allow create: if request.auth != null;
    }
  }
}
```

## How to Update:

1. Go to your Firebase Console: https://console.firebase.google.com
2. Select your project: taskdefender-68cfd
3. Navigate to "Firestore Database" in the left sidebar
4. Click on the "Rules" tab
5. Replace the current rules with the updated rules above
6. Click "Publish" to save the changes

## What These Rules Do:

- **Users Collection**: Users can only read/write their own user document
- **Tasks Collection**: Users can only access tasks where they are the owner (userId matches)
- **Focus Sessions**: Users can only access their own focus sessions
- **Teams Collection**: Users can access teams they are members of
- **Security**: All operations require authentication (request.auth != null)

After updating these rules, your authentication should work properly and users will be able to access their data.