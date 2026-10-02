# Rentals Property API

REST API for a rental-property marketplace, built with **Node.js, Express 5, and PostgreSQL**. Engineered with a mobile-first architecture to serve both a **Jetpack Compose Android client** and a **React web client**, emphasizing data integrity, Server-Driven UI (SDUI), and defensive API design.

## Tech Stack

Node.js · Express 5 · PostgreSQL (`pg` pool) · JWT · bcryptjs · Joi · Multer · express-rate-limit

---

## Key Engineering Decisions

- **Server-Driven UI (SDUI) & Multi-Tier Caching:**  
  A centralized `/config` endpoint delivers single-field boundaries (`fieldValidation`), dynamic dropdown options, and cross-field domain rules (`crossFieldConstraints` such as `floorNo <= totalFloors` and tenant requirements). Dynamic validation allows client form logic to update instantly without app releases. Backed by in-memory caching and 24-hour HTTP cache headers to minimize database load.

- **Pre-Validation PATCH Normalization Middleware:**  
  Solves the classic partial-update dilemma where cross-field validation rules (e.g., `floorNo <= totalFloors`) fail when the client submits only one updated field. A dedicated `normalizePropertyUpdate` middleware verifies ownership, validates non-empty payloads, maps database snake_case columns, and hydrates missing fields (`{ ...mappedExisting, ...req.body }`) before requests reach Joi. This allows Joi to execute full-object constraint validation on partial updates while attaching `req.existingProperty` to eliminate redundant database queries in downstream controllers.

- **Immutable Interaction Auditing Without Cascading Data Loss:**  
  * **Favorites:** Uses a relational junction table with `(user_id, property_id)` composite primary key and `ON DELETE CASCADE` for referential integrity.  
  * **Contact History:** Stored in a dedicated `contacted_properties` table with `(user_id, property_id)` composite primary key to deduplicate contacts and record `contacted_at` timestamps. **Intentionally omits a foreign key to `properties(id)`** so historical unlock records and lifetime contact counts are never refunded or lost when a landlord removes a listing. `GET /me/contacted` dynamically joins only active listings while retaining historical contact metrics.

- **Sandboxed Media Lifecycle & Zero-Leak File Management:**  
  Multer enforces 5MB limits and MIME type filtering. Filenames are namespaced with `user_<id>_` and randomized suffixes to eliminate millisecond upload collisions. The cleanup pipeline checks this owner prefix before unlinking—ensuring seed assets and shared media are preserved, while orphan images from edited or deleted listings are purged using error-tolerant asynchronous cleanup.

- **Dynamic Search & SQL Accumulator Pipeline:**  
  Search endpoints support multi-select query arrays (e.g., `?bedrooms=1&bedrooms=2`) translated to native PostgreSQL `= ANY()` clauses alongside grouped boolean tenant rules (`OR` logic). Property payloads expose canonical `city_id` references, offloading label resolution to client-side memory via cached config data to eliminate repetitive `JOIN cities` queries.

- **Scraping Defense & Tiered Rate Limiting:**  
  Dual-tier protection using `express-rate-limit`: a global IP-based firewall prevents denial-of-service attempts, while a user-scoped limiter throttles owner contact unlocks (`GET /properties/:id/contact`) to 10 reveals per 24 hours. Sensitive fields like `owner_id` are stripped from public responses.

- **Express 5 Native Async Routing:**  
  Eliminates boilerplate `try/catch` wrappers across controllers by relying on Express 5's native asynchronous promise rejection routing. Centralized error middleware intercepts PostgreSQL constraint codes (such as `23505` unique violations on email/favorites) and Multer upload limits, returning standardized HTTP responses.

---

## API Reference

Base URL: `/api/v1`

| Domain | Method | Endpoint | Auth | Purpose |
|---|---|---|---|---|
| **Metadata** | `GET` | `/config` | Public | Cached SDUI rules, field boundaries & constraints |
| **Auth** | `POST` | `/auth/signup` | Public | Register new user account |
| | `POST` | `/auth/login` | Public | Authenticate user and issue JWT |
| **Properties** | `GET` | `/properties` | Public | Multi-filter search and listing feed |
| | `GET` | `/properties/:id` | Public | Property details (omits sensitive owner ID) |
| | `POST` | `/properties` | User | Create listing (auto-generates title) |
| | `PATCH` | `/properties/:id` | Owner | Normalized partial update with photo diffing |
| | `DELETE` | `/properties/:id` | Owner | Delete listing & purge owner photo files |
| | `GET` | `/properties/:id/contact` | User | Reveal owner contact (Rate limit: 10/day) |
| **User State** | `GET` | `/me` | User | Profile, lifetime contact stats, and activity |
| | `GET` | `/me/listed-properties` | User | Listings published by authenticated user |
| | `GET` | `/me/favorites` | User | Favorited listings with total count |
| | `POST` | `/me/favorites/:propertyId` | User | Toggle favorite status |
| | `GET` | `/me/contacted` | User | History of active contacted listings |
| **Media** | `POST` | `/upload` | User | Upload image (Namespaced `user_<id>_`) |

---

## Database Architecture

```sql
cities               (id, name)
users                (id, name, email, password_hash, phone, created_at)
properties           (id, owner_id FK, city_id FK, rent, deposit, bedrooms, floor_no, total_floors, ...)
favorites            (user_id FK, property_id FK CASCADE)
contacted_properties (user_id FK, property_id [NO FK], contacted_at)
```

### Indexing Strategy
Explicit B-tree indexes optimize query execution and eliminate sequential scans across search and join operations:
* `idx_properties_city_locality` on `(city_id, locality)`: Accelerates composite geographical filtering.
* `idx_properties_rent` on `(rent)`: Speeds up range filtering and price sorting.
* `idx_properties_bedrooms` on `(bedrooms)`: Optimizes multi-select bedroom filtering.
* `idx_properties_owner` on `(owner_id)`: Prevents sequential scans during owner dashboard lookups and foreign key sweeps.
* `idx_favorites_property_id` on `(property_id)`: Optimizes reverse lookups and foreign key cascade checks.
* `idx_contacted_properties_property_id` on `(property_id)`: Accelerates lookups auditing all contacts associated with a property ID.

---

## Project Structure

```text
backend/
├── controllers/     # Route logic (auth, config, contact, favorite, me, property, upload)
├── routes/          # Express 5 routers & modular property ID sub-routers
├── middlewares/     # Auth, normalizers, validation (body/query/params), rate limiting, error handler
├── validators/      # Joi schemas for requests and search filters
├── db/              # pg connection pool, schema.sql, and indexes
├── scripts/         # Seed script with regional cities and authentic mock listings
├── utils/           # CustomError and photo cleanup utilities
├── public/images/   # Static asset delivery for property photos
├── app.js           # Express app setup, rate limiters, static mounts
├── server.js        # Server boot and database connection checks
└── test.http        # End-to-end REST Client test suite
```

<details>
<summary><strong>Run Locally</strong></summary>

### 1. Install Dependencies
```bash
npm install
```

### 2. Connect to PostgreSQL
Open the PostgreSQL command line client on your operating system:

* **Linux:**
  ```bash
  sudo -u postgres psql
  ```
* **macOS:**ookups and foreign key sweeps.
* `idx_favorites_property_id` 
  ```bash
  psql postgres
  ```
* **Windows:**  
  Open **SQL Shell (psql)** or connect via **pgAdmin**.

### 3. Create User & Database
Inside the `psql` console, run:
```sql
CREATE USER your_username WITH PASSWORD 'your_password';
CREATE DATABASE rentals OWNER your_username;
\q
```

### 4. Configure Environment
Copy `.env.example` to `.env` and fill in your PostgreSQL credentials:
**Linux / macOS / PowerShell:**
```bash
cp .env.example .env
```
**Windows (Command Prompt):**
```cmd
copy .env.example .env
```
Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Then set the generated value as `SECRET_STR` in `.env`:
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
Execute the schema migration and run the seeder:
```bash
psql -U your_username -d rentals -f db/schema.sql
node scripts/seed.js
```

### 6. Start the Server
```bash
# Production start
npm start

# Development mode
npm run dev
```

API runs at `http://localhost:8000/api/v1`.  
Automated test suite available via `test.http` using the VS Code / VSCodium REST Client extension.
</details>