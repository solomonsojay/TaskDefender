# Firebase Security Rules Configuration

## 🔥 **CRITICAL: Update Your Firestore Security Rules**

Your current Firestore rules are likely blocking all operations. You **MUST** update them in the Firebase Console.

### **Step 1: Go to Firebase Console**
1. Visit: https://console.firebase.google.com
2. Select your project: **taskdefender-68cfd**
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **"Rules"** tab

### **Step 2: Replace Current Rules**

Copy and paste these **EXACT** rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tasks collection - users can only access their own tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Focus sessions - users can only access their own sessions
    match /focusSessions/{sessionId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Teams collection - team members can read/write teams they belong to
    match /teams/{teamId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.adminId ||
         request.auth.uid in resource.data.members[].userId);
      allow write: if request.auth != null && request.auth.uid == resource.data.adminId;
      allow create: if request.auth != null;
    }
    
    // Team invitations - allow reading for verification
    match /teamInvitations/{inviteId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.createdBy;
      allow create: if request.auth != null;
    }
    
    // User profiles (public read for team features)
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### **Step 3: Click "Publish"**
After pasting the rules, click the **"Publish"** button to save them.

## 🔐 **Firebase Authentication Settings**

### **Step 1: Enable Email/Password Authentication**
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. **DISABLE** "Email link (passwordless sign-in)" unless specifically needed

### **Step 2: Configure Authorized Domains**
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Ensure these domains are added:
   - `localhost`
   - `taskdefender-68cfd.firebaseapp.com`
   - `*.webcontainer.io`
   - `*.bolt.new`
   - `*.stackblitz.io` (if using StackBlitz)

### **Step 3: Email Verification Settings**
1. Go to **Authentication** → **Templates**
2. Customize the **Email address verification** template if needed
3. Ensure the action URL points to your domain

## 📧 **Email Configuration (Optional but Recommended)**

### **Custom Email Templates:**
1. Go to **Authentication** → **Templates**
2. Customize these templates:
   - **Email address verification**
   - **Password reset**
   - **Email address change**

### **SMTP Configuration (Optional):**
For production, consider setting up custom SMTP in **Authentication** → **Settings** → **SMTP settings**

## 🗄️ **Firestore Database Setup**

### **Create Required Collections:**
Your app will automatically create these collections, but you can pre-create them:

1. **users** - User profiles and settings
2. **tasks** - User tasks and todos
3. **teams** - Team information and members
4. **focusSessions** - Focus session data
5. **teamInvitations** - Team invitation codes

### **Indexes (Auto-created):**
Firestore will automatically create indexes for:
- `tasks` ordered by `createdAt`
- `tasks` filtered by `userId`
- `focusSessions` filtered by `userId`

## 🔧 **Storage Rules (If Using File Uploads)**

If you plan to use Firebase Storage for profile pictures:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own profile pictures
    match /users/{userId}/profile/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Team logos (admin only)
    match /teams/{teamId}/logo/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Add team admin check if needed
    }
  }
}
```

## ✅ **Verification Checklist**

After updating the rules, verify:

- [ ] Firestore Security Rules updated and published
- [ ] Email/Password authentication enabled
- [ ] Authorized domains configured
- [ ] Email templates configured
- [ ] Storage rules updated (if using file uploads)
- [ ] Test user registration works
- [ ] Test email verification works
- [ ] Test data read/write operations work

## 🚨 **Important Notes**

1. **Security Rules are CRITICAL** - Without proper rules, your app won't work
2. **Test in Development** - Always test authentication flow after rule changes
3. **Monitor Usage** - Check Firebase Console for any permission errors
4. **Backup Rules** - Save your working rules before making changes

## 🆘 **Troubleshooting**

If you still get permission errors:

1. **Check Browser Console** for specific error messages
2. **Verify User Authentication** - ensure user is properly signed in
3. **Check Rule Simulator** in Firebase Console
4. **Test with Firebase Emulator** for local development

---

**After updating these rules, your TaskDefender app should work perfectly with Firebase! 🛡️🔥**