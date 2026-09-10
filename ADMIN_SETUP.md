# Fixsy - Admin Setup Guide

## 🔐 Creating Your First Admin Account

After deploying the new Firestore Rules, you need to manually add your first admin to the `admins` collection.

### Method 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your Fixsy project
3. Navigate to **Firestore Database**
4. Click **Start Collection**
5. Collection ID: `admins`
6. Click **Next**
7. Add a document with these fields:
   - `uid`: `YOUR_FIREBASE_AUTH_UID` (string)
   - `email`: `your-email@example.com` (string)
   - `role`: `super_admin` (string)
   - `createdAt`: `Current timestamp` (timestamp)
8. Click **Save**

### Method 2: Using the Setup Script

1. Get your Firebase UID first:
   ```javascript
   // Log in to your app, then in browser console:
   console.log(firebase.auth().currentUser.uid);
   ```

2. Update `scripts/setup-admin.ts`:
   ```typescript
   const adminUID = 'YOUR_ACTUAL_UID_HERE';
   const adminEmail = 'your-email@example.com';
   ```

3. Run the script:
   ```bash
   npm run setup-admin
   ```

### Method 3: Manual Firestore Document Creation

Create a new document in the `admins` collection with this structure:

```json
{
  "uid": "abc123xyz456",
  "email": "admin@fixsy.com",
  "role": "super_admin",
  "createdAt": "2025-12-24T03:00:00.000Z"
}
```

## ✅ Verification

After adding your admin:

1. Log out and log back in
2. You should see admin-specific features
3. The admin panel should be accessible

## 🚨 Security Notes

- **Never hardcode admin emails in code**
- Only add trusted users to the `admins` collection
- Keep your Firebase console access secure
- Regularly audit the `admins` collection

## 📝 Adding More Admins

To add more administrators, simply create new documents in the `admins` collection with their UID, email, and role.

---

**Created**: December 24, 2025  
**Last Updated**: December 24, 2025
