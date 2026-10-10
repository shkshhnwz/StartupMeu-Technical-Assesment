StartupMeu Connect
A MERN-stack platform connecting startup founders with potential investors.
Built as a technical assessment for the Software Engineer Intern – MERN Stack role at StartupMeu.
Live application: https://startup-meu-technical-assesment.vercel.app/
Source code: https://github.com/shkshhnwz/StartupMeu-Technical-Assesment
Overview
StartupMeu Connect provides a marketplace where founders can publish fundraising opportunities and investors can discover businesses and express interest. Separate founder and investor dashboards help each role manage its activity.
Features
1. Authentication and role-based access
- Founder and investor registration and login
- Password hashing and authenticated sessions
- Session restoration and protected routes
- Role-based permissions for founder- and investor-only actions
- Input validation and user-friendly authentication errors
2. Founder listing management
- Create, edit, publish, and delete business listings
- Draft and published listing states
- Business information including industry, stage, location, funding amount, website, and branding
- Ownership-based access controls
- Founder dashboard with listings and interest activity
3. Opportunity discovery
- Browse published startup opportunities
- Search by business name or relevant keywords
- Filter by industry, stage, and location
- Paginated results and individual opportunity detail pages
- Empty states for searches with no matches
4. Investor interest workflow
- Investors can express interest in published opportunities with an optional message
- Prevent duplicate interest requests for the same listing
- Founders can accept or decline pending requests on their own listings
- Investors can track the status of their submitted requests
- Contact information is not exposed on public opportunity listings
5. Dashboards and responsive UI
- Founder dashboard: listings, interest counts, and recent requests
- Investor dashboard: sent requests and status overview
- Responsive layouts for mobile, tablet, and desktop
- Form validation, loading indicators, empty states, and feedback messages
Technology stack
Layer	Technology
Frontend	React.js
Backend	Node.js, Express.js
Database	MongoDB
API	REST
Deployment	Vercel (live application)
Version control	Git and GitHub


Repository structure
StartupMeu-Technical-Assesment/
├── backend/       # Server-side API and database integration
├── frontend/      # React application
├── docs/          # Project documentation
├── .gitignore
└── LICENSE
Getting started
Prerequisites
- Node.js and npm
- A MongoDB database (local or MongoDB Atlas)
- Git
Clone the repository
git clone https://github.com/shkshhnwz/StartupMeu-Technical-Assesment.git
cd StartupMeu-Technical-Assesment
Install dependencies
cd backend
npm install
cd ../frontend
npm install
Configure environment variables
Create the environment files required by the frontend and backend. Refer to the project's source configuration for the exact variable names. You will typically need a MongoDB connection string, an authentication secret, the frontend origin, and the API base URL.
Do not commit .env files, database credentials, or authentication secrets.
Run locally
In one terminal:
cd backend
npm run dev
In a second terminal:
cd frontend
npm run dev
Open the local URL printed by the frontend development server. If either package does not define a dev script, use the script listed in its package.json instead.
How to use
1. Register as a founder or investor and sign in.
2. As a founder, create a business listing, save it as a draft, and publish it when ready.
3. As an investor, browse published opportunities, apply filters, and open a listing.
4. Express interest in a business and track the request from the investor dashboard.
5. As the listing owner, review incoming requests and accept or decline pending interest.
Development and AI workflow
The assessment requested the use of Code0 for AI-assisted development and Git operations. I installed and attempted to configure Code0, but its Codex integration repeatedly returned “Codex app-server connection closed.” Troubleshooting included updating the Codex CLI, confirming authentication, checking app-server availability, and testing the extension in a separate VS Code environment. The integration remained unavailable during development.
To avoid delaying the assessment, I continued implementation in my existing development environment. I did not use Code0 to implement, debug, refactor, test, or commit the application, and I have informed the StartupMeu hiring team about the issue. I can explain the architecture, implementation choices, and troubleshooting process during a technical review.
Evaluation walkthrough
For a functional review, test the following flows:
- Registration and login for both roles, including invalid credentials and duplicate email handling
- Founder listing creation, draft/publish flow, editing, and ownership restrictions
- Public discovery, combined search filters, pagination, and opportunity details
- Investor interest submission, duplicate prevention, and request status tracking
- Founder acceptance/decline actions and role restrictions
- Responsive navigation and forms on mobile and desktop
Author
Shahnawaz Shaikh
Developed for the StartupMeu MERN Stack internship technical assessment.
