# Rentals

A full-stack rent-only property listing and search application built with React, Jetpack Compose, Node.js, Express, and PostgreSQL. The project implements a single backend serving both a React Web SPA and a native Android application.

The architecture emphasizes strict separation of concerns and scalable modularity.

## Tech Stack

* **Web Client:** React, Vite, React Router, Axios, CSS
* **Android Client:** Jetpack Compose, ViewModel, StateFlow, Repository Pattern
* **Backend:** Node.js, Express 5, Joi, JWT, express-rate-limit, Multer
* **Database:** PostgreSQL (raw SQL queries via pg pool)

## Key Architectural Decisions & Engineering Highlights

* **Cross-Platform Architecture:** A single Express/PostgreSQL backend serves both the React Web SPA and the native Android application. Both clients share consistent domain models, data flows, and state boundaries.

* **Targeted Caching & Real-Time Data:**
  * **Online-Only Property Data:** Deliberately designed the clients to fetch property data in real-time without offline caching. This ensures users never see or contact owners of stale or deleted listings.
  * **Auth Session (Disk):** JWT tokens are persisted in `localStorage` (Web) and `EncryptedSharedPreferences` (Android). The Android client leverages hardware-backed Keystore encryption to protect session tokens across process terminations.
  * **Application Config (RAM):** Global settings like city lists, dropdown options, and validation boundaries are fetched once on startup and held in memory to prevent redundant API calls.
  * **Lazy Initialization:** React Contexts utilize lazy initialization (`useState(() => ...)`) to read persisted state from the disk only once on startup. This prevents synchronous disk reads from blocking UI re-renders across the application. On Android, this exact same performance is achieved by keeping state inside Kotlin Singleton Repositories, which isolate initialization logic from Jetpack Compose recomposition cycles.

* **Domain-Driven Data Layer:** App state is strictly partitioned across three independent domains (`Auth`, `Config`, `UserData`). Web Context Providers map directly to Kotlin Singleton Repositories on Android. Screen-level ViewModels consume only the specific domain repositories they require.

* **Strict Boundary Between UI and Data Layer:** Android Repositories avoid Jetpack Compose UI state (`mutableStateOf`) to maintain pure domain separation. Repositories expose standard Kotlin `StateFlow`, which Composables observe safely using `collectAsStateWithLifecycle()` to prevent background memory leaks.

* **Web Client Styling:** Used CSS variables to maintain a consistent color theme, and implemented media queries combined with Flexbox to handle responsive multi-column layouts across different screen sizes.

## Backend System Design

* **Server-Driven Configuration & Validation (SDUI):** A centralized `/config` endpoint dictates frontend behavior by delivering static options, single-field validation limits, and complex cross-field constraints (e.g., ensuring `floor_no` does not exceed `total_floors`, and requiring at least one tenant preference). 

* **Dual-Layer Config Caching:** To protect database resources, the config payload is cached in a server-side Node.js memory variable to eliminate repetitive SQL queries, and served with a 24-hour HTTP `Cache-Control` header for optimal client-side performance.

* **Resilient PATCH Normalization:** A dedicated middleware (`normalizePropertyUpdate.js`) merges partial client updates with the existing database record. This allows the centralized Joi validation middleware to strictly enforce the exact same schema (rejecting unknown parameters) for both POST and PATCH requests, ensuring the final controller always receives a standardized, fully validated object.

* **Data Minimization & Privacy:** Public property endpoints strictly strip sensitive Owner Details (name, phone number, email) to prevent data scraping. While the frontend can determine property ownership locally via standard relational IDs, actual contact details are exclusively unlocked through an authenticated, rate-limited request to the `/contact` endpoint.

* **RESTful Search & Querying:** Implemented a robust query string API (e.g., `GET /properties?cityId=1&rentMax=15000`). URL parameters are dynamically translated into PostgreSQL `ANY()` clauses and `>=` conditions. All dynamic values are executed strictly as parameterized queries via the `pg` pool to prevent **`SQL Injection`**, ensuring data is filtered securely at the database level rather than in memory.

* **Media Lifecycle & Static Delivery:** Uploads are processed via Multer, capped at 5MB, and namespaced by user ID. Property photos are served natively via `express.static` with 24-hour cache-control headers (`maxAge: '1d'`) to optimize client-side load times and reduce backend bandwidth. When an owner removes an uploaded photo during an edit, or deletes a property entirely, the server automatically cleans up the corresponding image files from the disk to prevent storage leaks.

* **Data Protection:** The owner contact endpoint is protected by a user-scoped limit of 10 requests per 24 hours. Rate-limited requests return a `429 Too Many Requests` status alongside a precise reset timestamp to drive dynamic frontend UI countdowns. Private contact responses include `Cache-Control: no-store` to prevent browsers from caching sensitive owner information.

* **Native Async Routing & TOCTOU Mitigation:** Leveraged Express 5's native asynchronous routing to maintain clean controllers without repetitive `try/catch` blocks. Implemented a **strict defense against concurrent race conditions (Time-of-Check to Time-of-Use)** using a two-step boundary :
  * **Controller-Level Checks:** Performs upfront `SELECT` queries to provide fast, immediate feedback for standard duplicate requests.
  * **Database-Level Fallback:** A centralized error middleware acts as the absolute final boundary. It safely intercepts PostgreSQL constraint codes (e.g., catching `23505` unique violations if microscopic concurrent inserts bypass the controller check) and translates them into predictable HTTP `409` responses.

## Database Architecture

* **Normalized Relational Schema:** Designed normalized relational schemas in PostgreSQL for 5 core entities. Implemented nuanced referential integrity by utilizing `ON DELETE CASCADE` to safely clean up user-owned records (e.g., favorites and listings), while strictly applying `ON DELETE RESTRICT` to core reference data (e.g., `cities`) to prevent catastrophic cascading data loss.

* **Concurrency & Idempotency:** Leveraged PostgreSQL's native MVCC (Multi-Version Concurrency Control) to prevent read/write blockages during high-traffic search queries. Ensured API idempotency and prevented race conditions (e.g., gracefully handling duplicate favorites or repeated views of an owner's contact) by enforcing strict composite primary keys paired with `ON CONFLICT` resolution, avoiding expensive database table-level locks.

* **Query Optimization:** Implemented explicit B-tree indexing on foreign keys (e.g., `owner_id`, `property_id`) and search parameters (e.g., `rent`, `bedrooms`, `city_id`) to optimize query execution time.

* **Immutable Contact History:** Deliberately omitted the `properties(id)` foreign key constraint in the contact history table. This ensures that a user's lifetime contact metrics and historical interactions remain permanently intact for usage tracking, even if a landlord deletes the original property listing.

## Features

* User signup and login with JWT authentication.
* Browse, search, and filter properties by city, property type, rent range, minimum bedrooms/bathrooms, and tenant preferences.
* URL-based search state allows filtered results to be refreshed, shared, or navigated via browser history.
* Dedicated property details screen with a scrollable image gallery.
* Owners can add, edit, and delete their property listings.
* Contact rate limit of 10 owner contacts per user every 24 hours with a live frontend countdown.
* User dashboard for managing favorites, contacted properties, and owned listings.

## High-Level Project Structure

```text
rentals/
├── backend/
│   ├── controllers/   # API route logic and business rules
│   ├── middlewares/   # Global Error Handler, auth, validate, rate limiting, custom logger
│   ├── routes/        # Express 5 routers mapping endpoints to controllers
│   ├── validators/    # Joi schemas for request body/query validation
│   └── db/            # PostgreSQL connection pool and schema definitions
└── web/
    └── src/
        ├── components/   # Reusable UI elements (e.g., PropertyCard, PropertyList)
        ├── screens/      # Page-level UI components (e.g., Home, Search, Profile)
        ├── context/      # React Context definitions
        ├── providers/    # State management and application logic
        └── services/     # Axios API configuration and network calls
```

## API Reference

Base URL: `/api/v1`

| Domain | Method | Endpoint | Auth | Purpose |
|---|---|---|---|---|
| **Metadata** | `GET` | `/config` | Public | Cached SDUI rules, field boundaries & constraints |
| **Auth** | `POST` | `/auth/signup` | Public | Register new user account |
| | `POST` | `/auth/login` | Public | Authenticate user and issue JWT |
| **Properties** | `GET` | `/properties` | Public | Multi-filter search and listing feed |
| | `GET` | `/properties/:id` | Public | Property details (omits sensitive owner details) |
| | `POST` | `/properties` | User | Create listing (auto-generates title) |
| | `PATCH` | `/properties/:id` | Owner | Normalized partial update with photo diffing |
| | `DELETE` | `/properties/:id` | Owner | Delete listing & purge owner photo files |
| | `GET` | `/properties/:id/contact` | User | Reveal owner contact (Rate limit: 10/day) |
| **User State** | `GET` | `/me` | User | Profile, lifetime contact stats, and activity |
| | `GET` | `/me/listed-properties` | User | Listings published by authenticated user |
| | `GET` | `/me/favorites` | User | Favorited listings with total count |
| | `POST` | `/me/favorites/:propertyId` | User | Toggle favorite status |
| | `GET` | `/me/contacted` | User | History of active contacted listings |
| **Media** | `POST` | `/upload` | User | Upload image |
| | `GET` | `/images/:filename` | Public | Deliver static property photos (24h cache) |

<details>
<summary><strong>Local Development Setup</strong></summary>

### 1. Install Dependencies

Open two separate terminals from the root `rentals` project folder.

**Terminal 1 (Backend):**
```bash
cd backend
npm install
```

**Terminal 2 (Frontend):**
```bash
cd web
npm install
```

### 2. Connect to PostgreSQL
Open the PostgreSQL command line client on your operating system:

* **Linux:** `sudo -u postgres psql`
* **macOS:** `psql postgres`
* **Windows:** Open SQL Shell (psql) or connect via pgAdmin.

### 3. Create User & Database
Inside the `psql` console, run:
```sql
CREATE USER your_username WITH PASSWORD 'your_password';
CREATE DATABASE rentals OWNER your_username;
\q
```

### 4. Configure Environment
In the `backend` directory, copy `.env.example` to `.env` and fill in your PostgreSQL credentials:
```bash
cp .env.example .env
```
Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Set the generated value as `SECRET_STR` in `.env`:
```env
PORT=8000
DB_USER=your_username
DB_HOST=localhost
DB_NAME=rentals
DB_PASSWORD=your_password
DB_PORT=5432
SECRET_STR=<paste_generated_secret_here>
```

### 5. Initialize Schema & Seed Data
Execute the schema migration and run the seeder from the `backend` directory:
```bash
psql -U your_username -d rentals -f db/schema.sql
node scripts/seed.js
```

### 6. Start the Applications

**For Local Development (with Hot Reloading):**
```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start React frontend
cd web
npm run dev
```

**For Production Testing:**
```bash
# Terminal 1: Build the React frontend
cd web
npm run build

# Terminal 2: Start the Express backend
cd backend
npm start
```

</details>