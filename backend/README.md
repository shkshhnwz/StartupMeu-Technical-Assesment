# StartupMeu Connect — Backend

Backend REST API for **StartupMeu Connect (Founder & Investor Discovery Marketplace)**.

## Architecture

```text
backend/
├── config/
│   └── db.js                        # Mongoose MongoDB connection via process.env.MONGODB_URI
├── middleware/
│   └── errorHandler.js              # Centralized error handler (standard PRD format)
├── moduels/
│   ├── Authorization/               # Feature 1: Auth & Role-Based Access Control
│   │   ├── User.model.js            # User Schema, bcrypt hashing, safe serialization
│   │   ├── auth.validator.js        # Input validation for registration & login
│   │   ├── auth.middleware.js       # protect & authorizeRoles middlewares
│   │   ├── auth.controller.js       # register, login, logout, getMe, role test handlers
│   │   ├── auth.routes.js           # /api/auth routes
│   │   ├── auth.test.js             # Automated integration tests
│   │   └── index.js                 # Module exports
│   ├── founderListingManagement/    # Feature 2: Founder Listing Management
│   │   ├── Business.model.js        # Business opportunity schema & soft delete
│   │   ├── business.validator.js    # Field validation & sanitization
│   │   ├── business.controller.js   # Owner-scoped CRUD handlers
│   │   ├── business.routes.js       # /api/businesses routes
│   │   ├── business.test.js         # Integration tests
│   │   └── index.js                 # Module exports
│   ├── OpportunityDiscovery/        # Feature 3: Opportunity Discovery & Search
│   │   ├── discovery.controller.js  # Filter, pagination, bounded search
│   │   ├── discovery.routes.js      # /api/opportunities routes
│   │   ├── discovery.test.js        # Integration tests
│   │   └── index.js                 # Module exports
│   ├── investorInterestWorkflow/    # Feature 4: Investor Interest Workflow
│   │   ├── Interest.model.js        # Compound unique index & review timestamps
│   │   ├── interest.validator.js    # Submission & status validators
│   │   ├── interest.controller.js   # Privacy protection & workflow status update
│   │   ├── interest.routes.js       # /api/interests routes
│   │   ├── interest.test.js         # Integration tests
│   │   └── index.js                 # Module exports
│   └── dashboardSummary/            # Feature 5: Dashboard Summaries
│       ├── dashboard.controller.js  # Aggregated metrics & recent activity
│       ├── dashboard.routes.js      # /api/dashboard routes
│       ├── dashboard.test.js        # Integration tests
│       └── index.js                 # Module exports
├── utils/
│   └── apiResponse.js               # Standardized success/error JSON response builders
├── .env.example                     # Sample environment variable definitions
├── app.js                           # Express app configuration & middlewares
├── server.js                        # HTTP server listener via process.env.PORT
└── seed.js                          # Demo account & listing seeder
```

## Environment Variables (`process.env`)

Every environment variable is read strictly from `process.env` without hardcoded fallbacks:

| Variable | Description | Example |
|---|---|---|
| `PORT` | HTTP port for Express server listener | `5000` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB Atlas / local connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key used for signing & verifying JWT tokens | `your_secret_32_chars` |
| `JWT_EXPIRES_IN` | Token validity period | `7d` |
| `CLIENT_URL` | Allowed client origin for CORS credentials | `http://localhost:5173` |
| `COOKIE_SECRET` | Signing secret for HTTP-only cookie parser | `your_cookie_secret` |

Copy the example file to configure:
```bash
cp .env.example .env
```

## API Specification

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register founder or investor |
| `POST` | `/api/auth/login` | Public | Login and set HTTP-only cookie |
| `POST` | `/api/auth/logout` | Authenticated | Logout and clear cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session user |

### 2. Business Listings (`/api/businesses`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/businesses` | Founder | Create a new business opportunity (draft or published) |
| `GET` | `/api/businesses/mine` | Founder | Retrieve all listings owned by current founder |
| `GET` | `/api/businesses/:id` | Owner Founder | Retrieve own listing details (including draft) |
| `PATCH` | `/api/businesses/:id` | Owner Founder | Update own business opportunity |
| `DELETE` | `/api/businesses/:id` | Owner Founder | Soft-delete own business opportunity |

### 3. Discovery (`/api/opportunities`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/opportunities` | Public | Search and filter published listings with pagination |
| `GET` | `/api/opportunities/:id` | Public | View published opportunity profile details |

### 4. Investor Interest (`/api/interests`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/interests` | Investor | Express interest in a published listing |
| `GET` | `/api/interests/sent` | Investor | Retrieve sent expressions of interest |
| `GET` | `/api/interests/received` | Founder | Retrieve inbound expressions of interest |
| `PATCH` | `/api/interests/:id/status` | Owner Founder | Accept or decline inbound interest request |

### 5. Dashboard Summaries (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/founder` | Founder | Summary metrics (listings, interest breakdown) & recent activity |
| `GET` | `/api/dashboard/investor` | Investor | Pipeline metrics & recent submitted interests |

## Running & Testing

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run integration test suite (70 tests)**:
   ```bash
   npm test
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Seed demo data**:
   ```bash
   npm run seed
   ```
