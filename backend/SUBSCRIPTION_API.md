# Subscription and Package Management API Documentation

## Overview
This document describes the new subscription package management system with automatic expiry processing, email notifications, and membership archival.

---

## Package Types

### Available Packages

1. **Basic (Monthly)** - `basic`
   - Duration: 30 days
   - Price: ₹999
   - Usage: Default entry-level membership

2. **3 Months Package** - `3months`
   - Duration: 90 days
   - Discount: ~7% savings compared to monthly
   - Price: ₹2,799

3. **6 Months Package** - `6months`
   - Duration: 180 days
   - Discount: ~17% savings compared to monthly
   - Price: ₹5,099

4. **Full Year Package** - `fullYear`
   - Duration: 365 days
   - Discount: ~25% savings compared to monthly
   - Price: ₹8,999

5. **Test 3-Minute Package** - `test_3min`
   - Duration: 3 minutes
   - Price: ₹0 (Free)
   - Usage: Testing and development only

---

## API Endpoints

### 1. Process Expired Memberships
**Endpoint:** `POST /subscription/process-expired`

**Description:** Checks all members, identifies expired subscriptions, archives them, and sends expiry notification emails.

**Authentication:** Admin only (via `checkAdmin` middleware)

**Request:**
```json
{}
```

**Response:**
```json
{
  "message": "Expired memberships processed successfully",
  "expiredCount": 5,
  "emailsSent": 4,
  "errors": [
    {
      "memberId": "user123",
      "email": "user@example.com",
      "error": "Email send failed"
    }
  ]
}
```

---

### 2. Send Renewal Reminders
**Endpoint:** `POST /subscription/send-reminders`

**Description:** Sends renewal reminder emails to members whose subscriptions expire within 7 days.

**Authentication:** Admin only

**Request:**
```json
{}
```

**Response:**
```json
{
  "message": "Renewal reminders sent successfully",
  "remindersSent": 12,
  "errors": null
}
```

---

### 3. Get Expired Members
**Endpoint:** `GET /subscription/expired-members`

**Description:** Retrieves all members whose subscriptions have expired (from the `expiredMembers` collection).

**Authentication:** Admin only

**Request:**
```json
{}
```

**Response:**
```json
{
  "message": "Expired members fetched successfully",
  "total": 5,
  "members": [
    {
      "uid": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "packageType": "basic",
      "status": "expired",
      "expiryDate": "2026-01-25T10:30:00.000Z",
      "archivedAt": "2026-01-26T10:30:00.000Z",
      "previousStatus": "active"
    }
  ]
}
```

---

### 4. Renew Membership
**Endpoint:** `PUT /subscription/renew/:memberId`

**Description:** Renews a member's subscription for a new package period. Moves the member from `expiredMembers` back to active `members` collection.

**Authentication:** None (but can be restricted to admin + member themselves)

**Parameters:**
- `memberId` (path): The unique ID of the member

**Request:**
```json
{
  "packageType": "3months"
}
```

**Response:**
```json
{
  "message": "Membership renewed successfully",
  "memberId": "user123",
  "newPackageType": "3months",
  "expiryDate": "2026-04-25T10:30:00.000Z"
}
```

---

### 5. Get Membership Status
**Endpoint:** `GET /subscription/status/:memberId`

**Description:** Retrieves detailed membership status for a specific member, including expiry date and days remaining.

**Authentication:** None

**Parameters:**
- `memberId` (path): The unique ID of the member

**Response:**
```json
{
  "memberId": "user123",
  "name": "John Doe",
  "packageType": "basic",
  "status": "active",
  "expiryDate": "2026-02-24T10:30:00.000Z",
  "daysRemaining": 29,
  "isExpired": false
}
```

---

## Firebase Collections

### Active Members Collection: `members`
```javascript
{
  uid: "user123",
  email: "user@example.com",
  name: "John Doe",
  role: "member",
  packageType: "basic",
  status: "active",
  joinDate: "2026-01-25T10:30:00.000Z",
  expiryDate: "2026-02-24T10:30:00.000Z",
  lastRenewalDate: "2026-01-25T10:30:00.000Z",
  lastReminderSentDate: "2026-02-17T10:30:00.000Z",
  createdAt: "2026-01-25T10:30:00.000Z",
  updatedAt: "2026-01-26T10:30:00.000Z"
}
```

### Expired Members Collection: `expiredMembers`
```javascript
{
  uid: "user123",
  email: "user@example.com",
  name: "John Doe",
  role: "member",
  packageType: "basic",
  status: "expired",
  joinDate: "2026-01-25T10:30:00.000Z",
  expiryDate: "2026-02-24T10:30:00.000Z",
  archivedAt: "2026-02-25T10:30:00.000Z",
  previousStatus: "active",
  createdAt: "2026-01-25T10:30:00.000Z"
}
```

---

## Automated Cron Jobs

The system includes two automated scheduled tasks:

### 1. Daily Expiry Check (2:00 AM)
- Checks all active members for expired subscriptions
- Archives expired members to `expiredMembers` collection
- Sends expiry notification emails
- Logs results for auditing

### 2. Daily Reminder Emails (9:00 AM)
- Checks members expiring within 7 days
- Sends renewal reminder emails
- Prevents duplicate reminders on the same day
- Logs results for auditing

---

## Email Templates

### Expiry Notification Email
**Sent when:** Subscription expires

**Contains:**
- Member's name
- Package type that expired
- Expiry date
- Call-to-action button to renew
- Contact information

### Renewal Reminder Email
**Sent when:** Subscription expires within 7 days

**Contains:**
- Member's name
- Days remaining until expiry
- Package type details
- Call-to-action button to renew
- Contact information

---

## Environment Variables Required

```
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
FRONTEND_URL=http://localhost:5173
```

### Gmail Setup Instructions
1. Enable 2-factor authentication on Gmail
2. Generate an "App Specific Password" (16-character password)
3. Use this password in `EMAIL_PASSWORD` environment variable
4. Set `EMAIL_USER` to your Gmail address

---

## Usage Example

### Admin creating a member with a package:

```bash
POST /admin/members/add
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123",
  "name": "John Doe",
  "packageType": "3months"
}
```

**Response:**
```json
{
  "message": "Member added successfully",
  "member": {
    "uid": "user123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "member",
    "packageType": "3months",
    "status": "active",
    "joinDate": "2026-01-25T10:30:00.000Z",
    "expiryDate": "2026-04-25T10:30:00.000Z"
  }
}
```

### Manual expiry check and email sending:

```bash
POST /subscription/process-expired
Authorization: Bearer admin_token

{}
```

### Checking membership status:

```bash
GET /subscription/status/user123
```

### Renewing an expired membership:

```bash
PUT /subscription/renew/user123
Content-Type: application/json

{
  "packageType": "6months"
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **201**: Created (for member creation)
- **400**: Bad Request (missing/invalid parameters)
- **401**: Unauthorized (invalid token)
- **404**: Not Found (member not found)
- **500**: Server Error

---

## Security Considerations

1. **Admin-only endpoints** are protected by `checkAdmin` middleware
2. **Email credentials** are stored in environment variables
3. **Expiry dates** are calculated server-side, not client-side
4. **Member data** in expired collection maintains audit trail

---

## Notes

- Package durations are calculated in milliseconds internally
- Email sending failures don't block membership archival (graceful degradation)
- Cron jobs run on server time (ensure server timezone is correct)
- Reminder emails are sent only once per day to the same member
- Test package (3 minutes) is designed for testing the expiry system quickly

