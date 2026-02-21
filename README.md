**Project Live Demo**:- [VM-Fitness](vm-fitness.netlify.app)
# Gym Management System - Project Working Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Routes & Endpoints](#api-routes--endpoints)
5. [Admin Features & Actions](#admin-features--actions)
6. [Member Features & Actions](#member-features--actions)
7. [Database Schema](#database-schema)
8. [Data Flow](#data-flow)

---

👤 Admin Account

## Email: vikasadmin@g.com

## Password:  123456

👤 Member Account

## Email: member2@gmail.com

## Password: 123456
.
## Project Overview

**Gym Management System** is a full-stack web application that manages gym operations including member management, supplement sales, diet planning, and order tracking.

### Key Features:
- Role-based access control (Admin & Member)
- Member registration and membership management
- Supplement e-commerce with shopping cart
- Diet planning for members
- Order management and tracking
- Membership renewal system
- Expired member notification
- Admin reports and statistics

---

## Tech Stack

**Frontend:**
- React.js with Hooks
- Vite (Build tool)
- Axios (HTTP client)
- Tailwind CSS & Inline Styles
- Firebase Authentication

**Backend:**
- Node.js + Express.js
- Firestore Database
- Firebase Admin SDK
- Cron Jobs (for scheduled tasks)

**Authentication:**
- Firebase Authentication
- JWT Token Verification

---

## Authentication & Authorization

### Login Flow:
1. User enters email & password
2. Firebase authenticates the user
3. Backend verifies role (Admin or Member)
4. Returns JWT token and user role
5. Token stored in localStorage
6. Routes are protected based on role

### Logout Flow:
1. Clear localStorage (idToken, uid, userRole)
2. Update UserContext state
3. Redirect to login page
4. AdminDashboard hidden from view

### Protected Routes:
- **Admin Routes**: `/admin` - Only accessible to users with `role === "admin"`
- **Member Routes**: `/supplements`, `/cart`, `/profile` - Only accessible to logged-in members
- **Public Routes**: `/`, `/login` - Accessible to everyone

---

## API Routes & Endpoints

### Authentication Routes (`/auth`)

#### POST `/auth/login`
- **Description**: Verify JWT token and get user role
- **Body**: `{ idToken: string }`
- **Response**: `{ uid, role, userType }`
- **Access**: Public
- **Purpose**: Determine if user is admin or member

#### GET `/auth/user/:uid`
- **Description**: Fetch complete user information
- **Headers**: `Authorization: Bearer {idToken}`
- **Params**: `uid` - User ID
- **Response**: User object with all fields (name, email, joinDate, expiryDate, dietDetails, etc.)
- **Access**: Authenticated users
- **Purpose**: Display profile information with join date, expiry date, and diet

---

### Member Routes (`/admin/members`)

#### GET `/admin/members`
- **Description**: Get all members
- **Headers**: `Authorization: Bearer {adminToken}`
- **Response**: Array of all members
- **Access**: Admin only
- **Purpose**: View all members in admin dashboard

#### POST `/admin/members`
- **Description**: Add new member (create account & store member data)
- **Headers**: `Authorization: Bearer {adminToken}`
- **Body**: `{ email, password, name, packageType }`
- **Creates**: 
  - Firebase Auth user
  - Member document in Firestore
  - Order entry for revenue tracking
- **Response**: New member object
- **Access**: Admin only
- **Purpose**: Register new gym member with selected package

#### PUT `/admin/members/:memberId`
- **Description**: Update member information
- **Headers**: `Authorization: Bearer {adminToken}`
- **Params**: `memberId` - Member UID
- **Body**: Fields to update (email, name, etc.)
- **Response**: Updated member object
- **Access**: Admin only
- **Purpose**: Edit member details

#### DELETE `/admin/members/:memberId`
- **Description**: Delete member account
- **Headers**: `Authorization: Bearer {adminToken}`
- **Params**: `memberId` - Member UID
- **Deletes**: From Firestore and Firebase Auth
- **Response**: Success message
- **Access**: Admin only
- **Purpose**: Remove member from system

#### PUT `/admin/members/:memberId/renew`
- **Description**: Renew member membership
- **Headers**: `Authorization: Bearer {adminToken}`
- **Params**: `memberId` - Member UID
- **Body**: `{ packageType }`
- **Creates**: Order entry for renewal (revenue tracking)
- **Updates**: Member's packageType, expiryDate, status
- **Response**: Updated member with new expiry date
- **Access**: Admin only
- **Purpose**: Extend membership and charge for renewal

---

### Supplement Routes (`/admin/supplements`)

#### GET `/admin/supplements`
- **Description**: Get all supplements
- **Response**: Array of all supplements
- **Access**: Public (for members to browse)
- **Purpose**: Display supplements on shop page

#### POST `/admin/supplements`
- **Description**: Add new supplement
- **Headers**: `Authorization: Bearer {adminToken}`, `Content-Type: multipart/form-data`
- **Body**: `{ name, description, price, image (file) }`
- **Response**: New supplement object
- **Access**: Admin only
- **Purpose**: Add new product to shop

#### PUT `/admin/supplements/:supplementId`
- **Description**: Update supplement details
- **Headers**: `Authorization: Bearer {adminToken}`
- **Params**: `supplementId`
- **Body**: Fields to update
- **Response**: Updated supplement
- **Access**: Admin only
- **Purpose**: Edit supplement info

#### DELETE `/admin/supplements/:supplementId`
- **Description**: Delete supplement
- **Headers**: `Authorization: Bearer {adminToken}`
- **Params**: `supplementId`
- **Response**: Success message
- **Access**: Admin only
- **Purpose**: Remove product from shop

---

### Order Routes (`/orders`)

#### POST `/orders/place-order`
- **Description**: Place a new supplement order
- **Headers**: `Authorization: Bearer {memberToken}`
- **Body**: `{ memberId, items: [{ name, price, quantity, type: "supplement" }], totalPrice }`
- **Creates**: Order document in Firestore
- **Response**: New order object
- **Access**: Members only
- **Purpose**: Create order from shopping cart

#### GET `/orders/member/:memberId`
- **Description**: Get member's orders
- **Headers**: `Authorization: Bearer {memberToken}`
- **Params**: `memberId` - Member UID
- **Response**: Array of member's orders
- **Access**: Members (their own), Admins
- **Purpose**: View order history

#### GET `/orders/all`
- **Description**: Get all supplement orders (excluding membership orders)
- **Headers**: `Authorization: Bearer {adminToken}`
- **Response**: Array of all supplement orders with member details
- **Access**: Admin only
- **Filters**: Excludes orders with items of type "membership" or "membership_renewal"
- **Purpose**: Admin dashboard - view supplement sales

#### GET `/orders/:orderId`
- **Description**: Get single order details
- **Headers**: `Authorization: Bearer {token}`
- **Params**: `orderId`
- **Response**: Order object with member info
- **Access**: Authenticated users
- **Purpose**: View order details

#### PUT `/orders/:orderId/status`
- **Description**: Update order status
- **Headers**: `Authorization: Bearer {adminToken}`
- **Params**: `orderId`
- **Body**: `{ status: "confirmed" | "collected" | "rejected" }`
- **Response**: Updated order
- **Access**: Admin only
- **Purpose**: Track order fulfillment

#### DELETE `/orders/:orderId`
- **Description**: Delete order
- **Headers**: `Authorization: Bearer {adminToken}`
- **Params**: `orderId`
- **Response**: Success message
- **Access**: Admin only
- **Purpose**: Remove order from system

---

### Diet Routes (`/diet`)

#### GET `/diet/members`
- **Description**: Get all members for diet management
- **Headers**: `Authorization: Bearer {adminToken}`
- **Response**: Array of members with diet details
- **Access**: Admin only
- **Purpose**: Display members in diet management tab

#### POST `/diet/add`
- **Description**: Add or update member's diet plan
- **Headers**: `Authorization: Bearer {adminToken}`
- **Body**: `{ memberId, dietDetails }`
- **Updates**: Member's dietDetails and dietUpdatedAt
- **Response**: Success message
- **Access**: Admin only
- **Purpose**: Assign custom diet plan to member

#### GET `/diet/:memberId`
- **Description**: Get member's diet details
- **Headers**: `Authorization: Bearer {token}`
- **Params**: `memberId`
- **Response**: `{ memberId, dietDetails, updatedAt }`
- **Access**: Member (own), Admin
- **Purpose**: View assigned diet plan

---

### Admin Stats Routes (`/admin/stats`)

#### GET `/admin/stats`
- **Description**: Get monthly statistics
- **Headers**: `Authorization: Bearer {adminToken}`
- **Response**: 
  ```json
  {
    newMembers: number,
    renewedMembers: number,
    expiredMembers: number,
    totalActiveMembers: number,
    totalOrders: number,
    totalRevenue: number
  }
  ```
- **Access**: Admin only
- **Purpose**: Display dashboard statistics and reports

---

### Notification Routes (`/notifications`)

#### GET `/notifications`
- **Description**: Get all notifications
- **Headers**: `Authorization: Bearer {adminToken}`
- **Response**: Array of notifications
- **Access**: Admin only
- **Purpose**: View notification history

#### POST `/notifications`
- **Description**: Send notification to all members
- **Headers**: `Authorization: Bearer {adminToken}`
- **Body**: `{ title, description }`
- **Response**: Created notification
- **Access**: Admin only
- **Purpose**: Broadcast messages to gym members

#### DELETE `/notifications/:notificationId`
- **Description**: Delete notification
- **Headers**: `Authorization: Bearer {adminToken}`
- **Params**: `notificationId`
- **Response**: Success message
- **Access**: Admin only
- **Purpose**: Remove notification

---

### Subscription Routes (`/subscription`)

#### POST `/subscription/process-expired`
- **Description**: Process expired memberships
- **Headers**: `Authorization: Bearer {adminToken}`
- **Body**: `{ adminIdToken }`
- **Actions**: 
  - Archive expired members
  - Send notification emails
  - Update member status to "expired"
- **Response**: Success message with count
- **Access**: Admin only
- **Purpose**: Handle automatic membership expiry

---

## Admin Features & Actions

### 1. **Member Management Tab**
**View:**
- ✅ List of all members
- ✅ Member details: name, email, package, status, join date, expiry date
- ✅ Filter by membership status

**Actions:**
- ✅ **Add New Member**: Create account with email, password, name, and package selection
  - Auto-generates: Member record, Auth user, Order entry for revenue
  - Calculates expiry date based on package duration
- ✅ **Renew Membership**: Extend member package
  - Updates: Package type, expiry date, status
  - Creates order entry for revenue tracking
- ✅ **Update Member**: Edit member details
- ✅ **Delete Member**: Remove member from system
- ✅ **View Expired Members**: Modal showing members with expired plans
  - Color-coded urgency (expired, expiring soon, active)

---

### 2. **Diet Management Tab**
**View:**
- ✅ Table of all members with diet status
- ✅ Shows "✓ Plan Added" or "⚠ No Plan" for each member

**Actions:**
- ✅ **Assign Diet Plan**: Add custom diet details for member
  - Shows multi-line textarea for detailed diet info
  - Auto-saves with timestamp
- ✅ **Edit Diet Plan**: Update existing diet details
- ✅ **View Member Diet**: See assigned diet with last update date

---

### 3. **Supplements Tab**
**View:**
- ✅ List of all supplements with details
- ✅ Show: Name, description, price, image

**Actions:**
- ✅ **Add Supplement**: Create new product
  - Fields: Name, description, price, image upload
  - Stores image on Supabase cloud storage
- ✅ **Update Supplement**: Edit product details
- ✅ **Delete Supplement**: Remove product from shop
- ✅ **View Inventory**: See all available supplements

---

### 4. **Orders Tab**
**View:**
- ✅ Table of supplement orders (excludes membership purchases)
- ✅ Shows: Member name, email, total price, items count, status, order date

**Actions:**
- ✅ **Expand Order**: View detailed items with:
  - Product image, name, description
  - Price and quantity for each item
- ✅ **Update Status**: Change order status
  - Options: ✓ Confirmed → 📦 Collected → ✗ Rejected
  - Color-coded status badges
- ✅ **Delete Order**: Remove order permanently
  - Includes confirmation dialog
  - Updates removed from database

---

### 5. **Subscriptions Tab**
**View:**
- ✅ Subscription management options
- ✅ Process expired memberships button

**Actions:**
- ✅ **Process Expired Memberships**: 
  - Automatically archives expired members
  - Sends notification emails
  - Updates member status to "expired"
- ✅ **View Membership Statistics**: 
  - New members this month
  - Renewed memberships
  - Expired memberships
  - Total active members

---

### 6. **Notifications Tab**
**View:**
- ✅ List of all notifications sent
- ✅ Shows: Title, description, date sent

**Actions:**
- ✅ **Send Notification**: Create and broadcast message
  - Fields: Title, description
  - Sends to all members
  - Stores in database for history
- ✅ **Delete Notification**: Remove notification record
- ✅ **View History**: See all past notifications

---

### 7. **Admin Dashboard Header**
**Actions:**
- ✅ **Print Reports**: Opens modal with monthly statistics
  - Shows: New members, renewals, revenue, orders count
  - Allows printing report
- ✅ **Logout**: Exit admin dashboard
  - Clears all auth data
  - Redirects to home page

---

## Member Features & Actions

### 1. **Home Page (`/`)**
**View:**
- ✅ Gym information
- ✅ Navigation to supplements shop
- ✅ View notifications from admin

**Actions:**
- ✅ **Browse Shop**: Go to supplements page

---

### 2. **Supplements Shop (`/supplements`)**
**View:**
- ✅ Grid of supplement cards
- ✅ For each supplement:
  - Image, name, description, price, weight/quantity

**Actions:**
- ✅ **Add to Cart**: Click "+" button to add supplement
  - Auto-adds quantity 1 to cart
  - Shows success toast message
- ✅ **Increase Quantity**: Click "+" button to add more
- ✅ **Decrease Quantity**: Click "−" button to reduce
- ✅ **Remove from Cart**: Click "Remove" button
  - Removes item completely from cart

---

### 3. **Shopping Cart (`/cart`)**
**View:**
- ✅ All items in cart with:
  - Image, name, description, price
  - Quantity controls, subtotal per item
- ✅ Order summary: Subtotal, shipping, total

**Actions:**
- ✅ **Adjust Quantity**: Use +/− buttons for each item
- ✅ **Remove Item**: Delete item from cart
- ✅ **Continue Shopping**: Go back to supplements
- ✅ **Confirm Order**: Place order
  - Opens confirmation modal
  - Shows items and total
  - Creates order in database
  - Clears cart after successful order

---

### 4. **Orders (`/profile → My Orders Tab`)**
**View:**
- ✅ List of all member's orders
- ✅ For each order:
  - Order ID, date, status, total price
  - Items count

**Actions:**
- ✅ **Expand Order**: Click "Show Items" to view details
  - See product names, descriptions, prices
- ✅ **Collapse Order**: Click "Hide Items" to collapse

---

### 5. **Profile (`/profile`)**
**Tabs:**

**Profile Info Tab:**
**View:**
- ✅ **Name**: Member's name
- ✅ **Email**: Member's email
- ✅ **Member Since**: Join date
- ✅ **Current Package**: Active package type (Basic, 3-Months, 6-Months, Full Year)
- ✅ **Membership Expiry Date**: When current plan expires
- ✅ **Status**: Active/Expired with color coding
- ✅ **Diet Plan**: 
  - Shows diet assigned by admin (if available)
  - Shows last update date
  - Displays "No diet plan assigned yet" if admin hasn't added one

**My Orders Tab:**
**View:**
- ✅ Same as Orders section above

---

### 6. **Navbar (All Pages)**
**View:**
- ✅ Logo: VM Fitness
- ✅ Navigation links
- ✅ Shopping cart icon with item count
- ✅ Profile icon

**Actions:**
- ✅ **Home**: Navigate to homepage
- ✅ **Supplements**: Go to shop
- ✅ **Notifications**: View all notifications
- ✅ **Cart**: View shopping cart
- ✅ **Profile**: View profile page
- ✅ **Logout**: Sign out (from profile menu)

---

### 7. **Notifications**
**View:**
- ✅ Toast notifications for actions (success/error)
- ✅ Notifications panel with messages from admin

---

## Database Schema

### Collections:

#### **members** Collection
```javascript
{
  uid: string,                    // Firebase Auth UID (Document ID)
  email: string,
  name: string,
  role: "member",
  status: "active" | "expired",
  packageType: "basic" | "3months" | "6months" | "fullYear",
  joinDate: ISO8601,
  expiryDate: ISO8601,
  createdAt: ISO8601,
  updatedAt: ISO8601,
  dietDetails: string,            // Custom diet plan text
  dietUpdatedAt: ISO8601
}
```

#### **users** Collection
```javascript
{
  uid: string,                    // Firebase Auth UID (Document ID)
  email: string,
  name: string,
  role: "admin",
  createdAt: ISO8601
}
```

#### **orders** Collection
```javascript
{
  _id: string,                    // Document ID
  memberId: string,               // FK to members.uid
  memberName: string,             // Denormalized for quick access
  memberEmail: string,
  items: [
    {
      productId: string,
      name: string,
      price: number,
      description: string,
      imageUrl: string,
      quantity: number,
      type: "supplement" | "membership" | "membership_renewal"
    }
  ],
  totalPrice: number,
  status: "confirmed" | "collected" | "rejected",
  placedAt: ISO8601,
  updatedAt: ISO8601
}
```

#### **supplements** Collection
```javascript
{
  _id: string,                    // Document ID
  id: string,                     // Same as _id
  name: string,
  description: string,
  price: number | string,
  imageUrl: string,               // Supabase URL
  weight: string,                 // e.g., "1kg"
  quantity: string,               // Same as weight
  createdAt: ISO8601
}
```

#### **notifications** Collection
```javascript
{
  _id: string,                    // Document ID
  title: string,
  description: string,
  createdAt: ISO8601
}
```

#### **diets** Collection (Historical)
```javascript
{
  _id: string,
  memberId: string,               // FK to members.uid
  dietDetails: string,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

---

## Data Flow

### Member Registration Flow:
```
Admin Dashboard (Add Member Form)
    ↓
POST /admin/members {email, password, name, packageType}
    ↓
Backend:
  1. Create Firebase Auth user
  2. Create member document in Firestore
  3. Calculate expiry date
  4. Create order entry for revenue
    ↓
Return success + member details
    ↓
Admin Dashboard updates member list
```

### Supplement Purchase Flow:
```
Member browses supplements
    ↓
Click "+" to add to cart (CartContext)
    ↓
Navigate to /cart
    ↓
Click "Confirm Order"
    ↓
POST /orders/place-order {memberId, items, totalPrice}
    ↓
Backend creates order in Firestore
    ↓
Clear cart (CartContext)
    ↓
Redirect to profile with success message
    ↓
Order visible in "My Orders" tab
```

### Membership Renewal Flow:
```
Admin Dashboard → Members Tab
    ↓
Click "Renew" button on member
    ↓
MemberRenewalModal opens
    ↓
Select new package
    ↓
PUT /admin/members/:memberId/renew {packageType}
    ↓
Backend:
  1. Update member package & expiry date
  2. Create order entry for revenue
    ↓
Update member list with new expiry date
    ↓
Show success message
```

### Diet Assignment Flow:
```
Admin Dashboard → Diet Management Tab
    ↓
Table of all members displayed
    ↓
Click "Add Diet" on member
    ↓
Edit form appears
    ↓
Enter diet details in textarea
    ↓
Click "Save Diet"
    ↓
POST /diet/add {memberId, dietDetails}
    ↓
Backend updates member document
    ↓
Refresh member list
    ↓
Member Profile shows updated diet
```

### Order Status Update Flow:
```
Admin Dashboard → Orders Tab
    ↓
Click "Show Order" to expand
    ↓
Click status dropdown
    ↓
Select new status (Confirmed → Collected → Rejected)
    ↓
PUT /orders/:orderId/status {status}
    ↓
Backend updates order document
    ↓
Refresh orders list with new status
```

### Revenue Tracking:
```
Event: Member Added
    ↓ Creates order with type: "membership"
Event: Membership Renewed
    ↓ Creates order with type: "membership_renewal"
Event: Supplement Purchased
    ↓ Creates order with type: "supplement"
    ↓
All orders summed in stats endpoint
    ↓
Admin sees totalRevenue = sum of all order totalPrice
```

---

## Key Features Explained

### 1. **Role-Based Access Control**
- Firebase determines admin vs member role
- Frontend routes protected based on role
- Backend endpoints check admin middleware

### 2. **Revenue Tracking**
- Every membership purchase creates an order
- Every supplement purchase creates an order
- Monthly revenue calculated from order totalPrice
- Stats endpoint aggregates monthly data

### 3. **Membership Expiry**
- Calculated based on package duration
- Can be renewed by admin
- Cron job processes expired memberships

### 4. **Diet Management**
- Admin assigns custom diet plans to members
- Members see assigned diet in profile
- Tracks when diet was last updated

### 5. **Shopping Cart**
- Uses React Context for state management
- Persists quantity for duplicate items
- Calculates total price on the fly

### 6. **Notifications**
- Admin can broadcast messages to all members
- Toast notifications for user actions
- Notification panel for viewing messages

---

## Summary

**Admin Capabilities:**
- Full member lifecycle management (add, edit, renew, delete)
- Supplement inventory management
- Order tracking and fulfillment
- Diet plan assignment
- Revenue monitoring
- Notification broadcasting
- Membership expiry processing

**Member Capabilities:**
- Browse and purchase supplements
- Manage shopping cart
- Place orders
- View order history
- View profile with membership info
- See assigned diet plan
- View notifications

**System Capabilities:**
- Role-based authentication
- Real-time cart management
- Revenue calculation and reporting
- Monthly statistics
- Membership expiry automation
- Cloud storage for images
- Database persistence
