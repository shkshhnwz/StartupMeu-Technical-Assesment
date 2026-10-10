# StartupMeu Connect — Backend

Backend REST API for **StartupMeu Connect (Founder & Investor Discovery Marketplace)**.

## Architecture

```text
backend/
├── config/
│   └── db.js                        # Mongoose MongoDB connection
├── middleware/
│   └── errorHandler.js              # Centralized error handler (standard PRD format)
├── moduels/
│   ├── Authorization/               # Feature: Auth & Role-Based Access Control
│   │   ├── User.model.js            # User Schema, bcrypt hashing, safe serialization
│   │   ├── auth.validator.js        # Input validation for registration & login
│   │   ├── auth.middleware.js       # protect & authorizeRoles middlewares
│   │   ├── auth.controller.js       # register, login, logout, getMe, role test handlers
│   │   ├── auth.routes.js           # /api/auth routes
│   │   ├── auth.test.js             # Automated integration tests
│   │   └── index.js                 # Feature exports (authRoutes, User, protect, authorizeRoles)
│   ├── OpportunityDiscovery/        # Feature: Discovery & search (Pending)
│   ├── founderListingManagement/    # Feature: Listing management (Pending)
│   └── investorInterestWorkflow/    # Feature: Interest workflow (Pending)
├── utils/
│   └── apiResponse.js               # Standardized success/error JSON response builders
├── .env.example
├── app.js                           # Express app configuration & middlewares
├── server.js                        # HTTP server listener
└── seed.js                          # Demo account seeder
```

## Auth & Role-Based Access Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register founder or investor |
| `POST` | `/api/auth/login` | Public | Login and set HTTP-only cookie |
| `POST` | `/api/auth/logout` | Authenticated | Logout and clear cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session user |
| `GET` | `/api/auth/test/founder` | Founder | Founder role verification endpoint |
| `GET` | `/api/auth/test/investor` | Investor | Investor role verification endpoint |

## Standard Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "_id": "67a89...",
      "name": "Jane Founder",
      "email": "jane@example.com",
      "role": "founder"
    },
    "token": "eyJhbG..."
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check your inputs",
    "fields": {
      "email": "Please provide a valid email address"
    }
  }
}
```

## Running & Testing

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run integration tests**:
   ```bash
   npm test
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Seed demo founder and investor accounts**:
   ```bash
   npm run seed
   ```
