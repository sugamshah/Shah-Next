# Firebase Security Rules Documentation

This document describes the comprehensive security rules implemented in the SHAH Communication Platform's Firebase Realtime Database.

## Overview

The security rules prevent unauthorized access and ensure that only authenticated users can perform actions on their own data. Admin verification is required for administrative actions.

## Key Security Features

### 1. User Protection
- **Admin Field Protection**: Users cannot modify their own `admin` status field. This is a one-way field set only by system administrators.
- **Personal Data**: Each user can only read/write their own profile, blocked users list, and contacts.
- **Email Immutability**: Email addresses cannot be changed after initial setting (read-only write validation).

### 2. Admin Authentication
- All admin actions require verification that the user is an admin in the `admins` tree.
- The `verified` field in the `admins` tree is immutable and only set during onboarding.
- Two-factor authentication status can be updated by the admin user only.

### 3. Chat Security
- **Private Chats**: Only the two participants can read and send messages.
- **Block Detection**: Messages are blocked if either user has blocked the other.
- **Message Sender Validation**: Only the actual message sender can create messages.

### 4. Group Security
- Only group members can read group messages.
- Only group members can send messages to their group.
- Only group admins can modify member lists and group settings.
- Users can only add themselves to groups (not removed/added by others unless admin).

### 5. Broadcast Security
- Only channel members can read broadcast messages.
- Only channel members can send messages.
- Only channel admins can modify channels and member lists.
- Invite codes are only visible to members and admins.

### 6. Report System
- Only admins can view all reports.
- Any authenticated user can submit a report.
- Report verdicts can only be set by admins.
- Reporter ID is enforced to match the submitting user.

### 7. Ban System
- Only admins can ban/unban users.
- Users can view their own ban status.
- All bans are logged in `adminLogs`.

### 8. Notification System
- Only the recipient can read their notifications.
- Only authenticated users can write notifications (admins can write to others).
- Notifications must include required fields: type, title, message, timestamp.
- Timestamps are validated against server time.

## Deployment Instructions

### 1. Update Firebase Security Rules

Deploy the new security rules to your Firebase project:

```bash
firebase deploy --only database:rules
```

Or using Firebase Console:
1. Go to Firebase Console → Realtime Database → Rules tab
2. Copy the content from `database.rules.json`
3. Publish the rules

### 2. Initialize Admin Access

Create the first admin user:

```javascript
// This should be done in a secure backend function
const admin = require('firebase-admin');

await admin.database().ref('admins/USER_UID_HERE').set({
  uid: 'USER_UID_HERE',
  email: 'admin@example.com',
  role: 'super_admin',
  verified: true,
  twoFactorEnabled: true,
  createdAt: admin.database.ServerValue.TIMESTAMP,
  lastLogin: admin.database.ServerValue.TIMESTAMP,
  permissions: ['manage_users', 'handle_reports', 'ban_users', 'manage_admins']
});

// Also add admin flag to user
await admin.database().ref('users/USER_UID_HERE').update({
  admin: true
});
```

### 3. Setup 2FA for Admin Accounts

Implement two-factor authentication for admin accounts (optional but recommended):

```typescript
const enable2FA = async (uid: string) => {
  await set(ref(db, `admins/${uid}/twoFactorEnabled`), true);
};
```

## Security Best Practices

1. **Never Store Sensitive Data in Realtime Database**
   - Never store passwords
   - Never store API keys or tokens
   - Use Cloud Functions for sensitive operations

2. **Validate Server-Side**
   - Always validate user input in Cloud Functions
   - Don't rely solely on client-side validation
   - Rate limit sensitive operations

3. **Monitor Admin Access**
   - Keep track of admin login attempts
   - Audit all admin actions through `adminLogs`
   - Review suspicious activity regularly

4. **Regular Security Audits**
   - Review security rules quarterly
   - Monitor for unusual access patterns
   - Keep Firebase SDK updated

5. **Implement Rate Limiting**
   - Limit message frequency
   - Limit report submissions
   - Limit login attempts

## Troubleshooting

### Users Can't Send Messages
- Check that both users exist in the `users` tree
- Verify neither user has blocked the other
- Ensure both users are in the chat room (for groups/broadcasts)

### Admin Actions Fail
- Verify the admin's `verified` field is set to `true`
- Check that the admin UID is correct
- Ensure the admin has the required permissions

### Notifications Not Appearing
- Verify the recipient UID exists
- Check that the notification includes all required fields
- Ensure the timestamp is not in the future

## Security Rules Reference

### Field Protection Example
```
// Users cannot modify their admin status
"admin": {
  ".write": false
}

// Users cannot modify their email (demonstration)
"email": {
  ".write": "auth.uid === $uid && newData.val() === data.val()"
}
```

### Admin Verification Pattern
```
// Only admins can perform this action
".write": "root.child('admins').child(auth.uid).child('verified').val() === true"
```

### Mutual Blocking Pattern
```
// Check if either user blocked the other
"!root.child('users').child(uid1).child('blocked').child(uid2).exists() &&
 !root.child('users').child(uid2).child('blocked').child(uid1).exists()"
```

## Support

For security concerns or to report vulnerabilities, please contact the admin team immediately.
