# Product Requirements Document (PRD)

## StartupMeu Connect — Founder & Investor Discovery Marketplace

**Version:** 1.0  
**Status:** Technical-assessment MVP specification  
**Product type:** Responsive MERN web application  
**Audience:** Software Engineer Intern technical assessment  
**Important:** This is an independently proposed prototype inspired by StartupMeu's public marketplace concept, not an official specification or a claim about their internal systems.

---

## 1. Product overview

StartupMeu Connect is a two-sided marketplace prototype that enables business founders to publish funding opportunity profiles and investors to discover opportunities, save listings, and express interest. Founders can review interest requests and accept or decline them. The product facilitates introductions only: **it does not handle investments, payments, escrow, securities transactions, or guaranteed returns**.

### Problem statement

Founders need a structured way to present their business and funding requirements. Investors need efficient discovery and filtering. Both sides need a clear, auditable process for initiating contact without exposing private contact information prematurely.

### Proposed solution

A role-based application with founder and investor accounts, business listing management, searchable public opportunities, and an interest-request workflow.

### Goals

1. Demonstrate complete end-to-end MERN development.
2. Implement secure role-based access and ownership checks.
3. Provide intuitive discovery and a meaningful founder–investor interaction.
4. Deliver a deployed, testable MVP with seed data and demo accounts.
5. Produce maintainable code and a clear README suitable for review.

### Non-goals (MVP)

- Real-money investment or payment processing.
- Identity verification, accreditation, financial due diligence, or legal investment advice.
- Automated investor matching, recommendation AI, or complex analytics.
- Real-time chat, video calling, notifications, or third-party CRM integration.
- Subscription billing or a full administrative back office.

---

## 2. Users and permissions

### Founder

- Register/login as a founder.
- Create and manage **their own** business listings.
- View received interest requests for their listings.
- Accept or decline a pending request.
- View dashboard counts and request statuses.

### Investor

- Register/login as an investor.
- Browse and filter published listings.
- View listing details.
- Express interest once per listing; optionally include a short message.
- See the status of their submitted requests.
- Save and unsave listings (stretch feature).

### Visitor (not logged in)

- Browse published listings and view public business details.
- Must sign in as an investor to express interest.

### Authorization matrix

| Action | Visitor | Founder | Investor |
|---|---|---|---|
| View published listings | Yes | Yes | Yes |
| Create listing | No | Yes | No |
| Edit/delete own listing | No | Yes | No |
| View incoming interest on own listings | No | Yes | No |
| Accept/decline own listing's interest | No | Yes | No |
| Express interest | No | No | Yes |
| View own sent interest | No | No | Yes |

**Rule:** Backend middleware and database ownership checks enforce permissions. Hiding UI controls is not sufficient.

---

## 3. MVP features and acceptance criteria

### F1. Authentication and role-based access — P0

**Requirements**
- Register with name, email, password, and role (`founder` or `investor`).
- Login/logout using secure authentication.
- Hash passwords with bcrypt or argon2.
- Prefer JWT in HTTP-only cookies; configure `Secure` in production, suitable `SameSite`, CORS credentials, and CSRF protection as appropriate for deployment topology.
- Persist authenticated session on refresh via `/api/auth/me`.
- Display validation and authentication errors without revealing sensitive internals.

**Acceptance criteria**
- Duplicate email cannot register.
- Incorrect credentials return a generic error.
- Unauthorized endpoints return 401; wrong-role or wrong-owner actions return 403.
- User cannot choose or change role through arbitrary protected request fields.

### F2. Founder listing management — P0

**Fields**
- `businessName` (required, 2–100 characters)
- `tagline` (required, max 160 characters)
- `description` (required, 50–3000 characters)
- `industry` (required, controlled enum/list)
- `stage` (required: Idea, Early Revenue, Growth, Established)
- `location` (required, city/country as text)
- `fundingRequired` (required, positive number)
- `currency` (required, e.g. INR/USD)
- `website` (optional valid HTTPS URL)
- `logoUrl` (optional)
- `status` (`draft` or `published`)
- `owner` (server-assigned authenticated founder ID)

**Acceptance criteria**
- Founder can create a draft and publish a valid listing.
- Founder can edit or delete only listings they own.
- Visitors see only published listings.
- Invalid inputs return consistent field errors.
- Founder dashboard lists own opportunities and counts received interest.

### F3. Opportunity discovery — P0

**Requirements**
- Card/grid listing page with business name, industry, stage, location, funding amount, and summary.
- Search by business name and relevant description keywords.
- Filter by industry, stage, and location; optional funding range.
- Paginate results, default 12 per page.
- Detail page for each published opportunity.

**Acceptance criteria**
- Filters can be combined and are reflected in URL query parameters.
- Empty results show an informative state.
- Draft and deleted listings are not exposed publicly.
- Search input is safely handled and query parameters are validated.

### F4. Investor interest workflow — P0

**Requirements**
- Investor clicks **Express Interest** on a published listing.
- Optional message (max 500 characters).
- Create a request with `pending` status.
- Founder sees requests for their own listings and can `accept` or `decline`.
- Investor sees sent requests and statuses.
- No automatic disclosure of personal email/phone in public listing or request response.

**Acceptance criteria**
- Investor cannot submit duplicate interest on the same listing (enforce compound unique index).
- Founder cannot express interest in their own listing because founder role is disallowed.
- Only the owning founder can act on a request.
- Only `pending` requests may transition to `accepted` or `declined`.
- Investor cannot alter request status.
- Requests for deleted listings are handled consistently (soft-delete listings recommended).

### F5. Dashboard and responsive UI — P0

**Requirements**
- Founder dashboard: listings, pending interest count, accepted interest count, recent requests.
- Investor dashboard: sent interest, status breakdown, links to opportunities.
- Accessible navigation, forms, loading states, empty states, toast/error messages.
- Responsive mobile/tablet/desktop layouts.

**Acceptance criteria**
- Core workflows work at ~375px mobile width and desktop.
- Inputs have labels, keyboard focus states, and accessible error messages.
- No critical console errors or broken navigation.

### Stretch features — P1 (only after P0 is complete)

1. Save/unsave listings.
2. Business logo upload via Cloudinary with upload validation.
3. Profile view counters and simple dashboard charts.
4. Email notification when interest is received/accepted.
5. Pitch deck upload with private access controls (do not expose sensitive documents publicly).

---

## 4. User journeys

### Founder

1. Sign up as founder → login.
2. Open dashboard → create business listing.
3. Save draft → complete required fields → publish.
4. Investor submits interest → request appears in dashboard.
5. Founder reviews request → accepts/declines → updated status visible to investor.

### Investor

1. Open discovery page → search/filter opportunities.
2. Open a listing detail page.
3. Sign up/login as investor when prompted.
4. Submit interest with optional message.
5. Check sent-interest dashboard for pending/accepted/declined status.

---

## 5. Information architecture and pages

| Route | Page | Access |
|---|---|---|
| `/` | Landing page with product pitch and featured opportunities | Public |
| `/opportunities` | Search/filter listing grid | Public |
| `/opportunities/:id` | Opportunity details | Public (published only) |
| `/register` | Sign up and role selection | Public |
| `/login` | Login | Public |
| `/founder/dashboard` | Founder summary and listings | Founder |
| `/founder/listings/new` | New listing form | Founder |
| `/founder/listings/:id/edit` | Edit own listing | Owner founder |
| `/founder/interests` | Incoming requests | Founder |
| `/investor/dashboard` | Sent interest and status | Investor |
| `*` | 404 page | Public |

**Design direction:** Professional, trustworthy SaaS marketplace. Clean cards, legible typography, restrained accent color, responsive sidebar/top navigation, prominent search and clear status indicators. Do not copy StartupMeu's brand assets or imply official affiliation without permission.

---

## 6. Data model (MongoDB / Mongoose)

### User

```js
{
  _id: ObjectId,
  name: String,
  email: String,             // unique, normalized lowercase
  passwordHash: String,      // never returned in API responses
  role: 'founder' | 'investor',
  createdAt: Date,
  updatedAt: Date
}
```

### Business

```js
{
  _id: ObjectId,
  owner: ObjectId,           // ref User; server-derived
  businessName: String,
  tagline: String,
  description: String,
  industry: String,
  stage: 'Idea' | 'Early Revenue' | 'Growth' | 'Established',
  location: String,
  fundingRequired: Number,
  currency: 'INR' | 'USD',
  website: String | null,
  logoUrl: String | null,
  status: 'draft' | 'published',
  deletedAt: Date | null,   // soft deletion
  createdAt: Date,
  updatedAt: Date
}
```

### Interest

```js
{
  _id: ObjectId,
  business: ObjectId,        // ref Business
  investor: ObjectId,        // ref User
  message: String,
  status: 'pending' | 'accepted' | 'declined',
  reviewedAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Suggested indexes

- `users.email`: unique.
- `interests`: unique compound `{ business: 1, investor: 1 }`.
- `businesses`: indexes on `status`, `industry`, `stage`, and `createdAt` as needed.
- For text search, start with a MongoDB text index or appropriately escaped/limited search; avoid unbounded user-supplied regex.

---

## 7. REST API specification

All endpoints use `/api` and return JSON. Use a consistent response shape:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed"
}
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check your inputs",
    "fields": {}
  }
}
```

| Method | Endpoint | Access | Behavior |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Authenticate and set cookie |
| POST | `/api/auth/logout` | Authenticated | Clear auth cookie |
| GET | `/api/auth/me` | Authenticated | Current user |
| GET | `/api/businesses` | Public | Published listings, search/filter/page |
| GET | `/api/businesses/:id` | Public | Published listing details; owner may see own draft via authorized route |
| POST | `/api/businesses` | Founder | Create own listing |
| GET | `/api/businesses/mine` | Founder | Own listings, including drafts |
| PATCH | `/api/businesses/:id` | Owner founder | Update own listing |
| DELETE | `/api/businesses/:id` | Owner founder | Soft-delete own listing |
| POST | `/api/interests` | Investor | Express interest |
| GET | `/api/interests/sent` | Investor | Own submitted requests |
| GET | `/api/interests/received` | Founder | Requests for own businesses |
| PATCH | `/api/interests/:id/status` | Owner founder | Accept/decline pending request |
| GET | `/api/dashboard/founder` | Founder | Summary counts |
| GET | `/api/dashboard/investor` | Investor | Summary counts |

**Implementation note:** Register fixed routes such as `/businesses/mine` before dynamic `/:id` routes to avoid route collisions. All pagination parameters must be bounded (e.g., max limit 50).

### Example: express interest

Request:

```http
POST /api/interests
Content-Type: application/json

{"businessId":"<valid-object-id>","message":"Interested in learning more about your expansion plan."}
```

Response: `201 Created`, request ID and `pending` status. A duplicate returns `409 Conflict`.

---

## 8. Architecture and project structure

**Frontend:** React + Vite, React Router, Axios or fetch, Tailwind CSS.  
**Backend:** Node.js + Express.js, Mongoose, bcrypt/argon2, cookie-based JWT authentication.  
**Database:** MongoDB Atlas.  
**Deployment:** Vercel/Netlify for frontend; Render/Railway for backend (subject to current plan availability).

```text
startupmeu-connect/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── validators/
│   │   └── app.js
│   ├── tests/
│   └── package.json
├── README.md
├── .gitignore
└── docs/PRD.md
```

Keep controller logic separate from routes; validate incoming data; centralize error handling. Avoid premature abstractions or unnecessary microservices.

---

## 9. Security, privacy, and reliability requirements

- Hash passwords; never log secrets or return password hashes.
- Store credentials and keys in environment variables; provide `.env.example` with placeholders only.
- Validate and sanitize inputs; protect against NoSQL operator injection and unsafe redirects.
- Enforce role and resource ownership on every protected API.
- Configure CORS for the exact deployed frontend origin; never use wildcard origin with credentialed requests.
- Rate-limit login/register and interest submission.
- Use HTTP-only cookies, HTTPS in production, and an appropriate CSRF strategy.
- Return generic error messages for authentication and internal server errors.
- Do not expose investor contact details publicly or promise investment outcomes.
- Add loading/error/empty states and handle offline/server failures gracefully.
- Seed fictional demo data only; never represent sample opportunities as real investments.

---

## 10. Development plan

### Phase 1 — Project setup and planning

- Initialize monorepo or two folders (`client`, `server`), Git, ESLint, `.gitignore`, `.env.example`.
- Establish MongoDB connection and API health endpoint.
- Build wireframes and define component hierarchy.
- **Deliverable:** App skeleton runs locally; first Git commit.

### Phase 2 — Authentication and authorization

- Implement User model, register/login/logout/me endpoints.
- Add protected routes and role middleware.
- Build auth forms and session handling.
- **Deliverable:** Founder and investor accounts work independently.

### Phase 3 — Listings and discovery

- Implement Business model and owner-scoped CRUD.
- Create listing forms, founder listing table, discovery grid, detail page.
- Add search, filters, and pagination.
- **Deliverable:** Founder publishes; visitor discovers.

### Phase 4 — Interest workflow

- Implement Interest model and unique constraint.
- Add submit interest, sent/received lists, accept/decline action.
- Add dashboard summaries and status indicators.
- **Deliverable:** End-to-end founder–investor interaction works.

### Phase 5 — Quality and delivery

- Test core authorization and edge cases.
- Fix responsive layout and accessibility issues.
- Add seed data, screenshots, demo credentials, README.
- Deploy both applications; verify CORS/cookies and production database connection.
- **Deliverable:** Live demo, repository, setup instructions, test evidence.

### Suggested priority if time is limited

1. Authentication + role authorization.
2. Business listing CRUD.
3. Public discovery and filtering.
4. Investor interest and founder response.
5. Deployment and README.
6. Stretch features only if everything above works.

---

## 11. Test plan

### Backend integration tests

- Register founder and investor successfully.
- Reject duplicate email and invalid login.
- Reject anonymous listing creation.
- Reject investor listing creation.
- Reject founder editing another founder's listing.
- Reject draft listing in public discovery.
- Reject anonymous/founder interest submissions.
- Reject duplicate investor interest (`409`).
- Reject unrelated founder accepting another founder's request.
- Reject invalid status transitions (accepted → declined).
- Confirm filtering and pagination produce correct results.

### Frontend smoke tests

- Register, login, logout, refresh session.
- Founder creates and publishes a listing.
- Investor searches and opens that listing.
- Investor submits interest and sees pending status.
- Founder accepts interest; investor sees accepted status.
- Test mobile navigation, forms, error messages, empty states.

### Definition of done

- All P0 features functional end to end.
- No critical authorization vulnerabilities in tested workflows.
- All major API routes documented and validated.
- Live URL works without local services.
- GitHub repository includes clear README and `.env.example`.
- Demo credentials and fictional sample data provided.
- Known limitations disclosed honestly.

---

## 12. Evaluation criteria (proposed, not StartupMeu's official rubric)

| Dimension | Weight |
|---|---:|
| Functional completeness and end-to-end workflow | 30% |
| API architecture and backend correctness | 25% |
| Authentication, authorization, validation | 20% |
| UX, responsiveness, accessibility | 15% |
| Documentation, testing, deployment | 10% |

These weights are suggested self-review priorities, not employer-provided scoring criteria.

---

## 13. CodeZero / AI-assisted workflow

CodeZero can be used to analyze the repository, create plans, and coordinate an installed coding CLI. It is not necessary to wait until the project is finished.

1. Start with the PRD in `docs/PRD.md`.
2. Ask the coding agent to read the PRD and propose a phase-by-phase implementation plan.
3. Approve only a small phase at a time.
4. Review generated changes, run tests, and commit working milestones.
5. Use CodeZero to examine architecture, dependencies, and changes as the repository evolves.
6. Keep a short record of which AI tools were used and what you personally tested.

### Ready-to-paste kickoff prompt

> Read `docs/PRD.md` completely. We are building StartupMeu Connect, a MERN technical-assessment MVP. First inspect the repository and produce an implementation plan for Phase 1 only. Explain proposed folder structure, dependencies, environment variables, and commands. Do not edit files until I approve the plan. Follow the PRD's role permissions and non-goals. Prefer simple, maintainable code over extra features.

### Ready-to-paste phase prompt

> Read `docs/PRD.md` and the current codebase. Implement only Phase [NUMBER] from the PRD. Before modifying code, summarize the files you will change and any security implications. After implementation, run applicable tests, report exact results, and list remaining issues. Do not claim tests passed unless they actually ran.

---

## 14. Submission checklist

- [ ] Public GitHub repository (or private access granted to reviewer).
- [ ] Deployed frontend URL.
- [ ] Deployed backend with working API.
- [ ] README with overview, stack, local setup, environment variables, features, and architecture.
- [ ] Demo founder and investor accounts using fictional data.
- [ ] Screenshots or 2–3 minute walkthrough video (if permitted).
- [ ] Testing summary and known limitations.
- [ ] Any specific Code0/CodeZero workflow evidence required by the assessment email.

---

## 15. Open questions to verify with the assessment instructions

1. Is Code0/CodeZero usage mandatory, and what evidence of use is required?
2. Is there a submission deadline or a required deployment provider?
3. Are there restrictions on AI-generated code or specific coding tools?
4. Must the repository be public or private?
5. Are any particular features mandatory beyond a functional MERN application?

**Scope principle:** Ship a reliable, secure, demonstrated MVP before attempting any optional feature.
