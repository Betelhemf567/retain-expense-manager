# Retain: Personal Expense & Budget Manager

Retain is a full-stack web app for recording personal expenses, setting a monthly budget, and seeing where your money goes. Regular users manage their own expenses and budget; admins manage categories and view platform-wide insights.

- **Live app:** https://retain-expense-manager-psi.vercel.app
- **API health check:** https://retain-api-xgu2.onrender.com/api/health

## Demo accounts

| Role  | Email             | Password    |
| ----- | ----------------- | ----------- |
| User  | demo@retain.app   | Demo1234!   |
| Admin | admin@retain.app  | Admin1234!  |

The demo user has about 120 seeded expenses spread over four months. Sign-up always creates a normal user. Admin accounts can only be created by the seed script.

> The API runs on a free Render instance that sleeps when idle, so the first request after a pause can take up to a minute. Open the API health link above and wait for `{"status":"ok"}` before using the app.

## Features

**Users**
- Sign up, sign in, sign out, with protected routes
- Create, view, update and delete expenses (title, amount, category, date, payment method, optional notes)
- Search by title or notes; filter by category, payment method, date range and amount range; sort by date or amount
- Pagination for large expense lists
- Set or update a monthly budget and see total spent, remaining budget, and whether you are within, approaching (80% or more used) or over budget
- Dashboard for any month: total spending, remaining budget, highest expense, spending by category, recent expenses
- Responsive layout (table on desktop, cards on phones)

**Admins**
- Create, rename and delete expense categories. Deleting a category moves its expenses to the default "Uncategorized" category, which cannot be changed or deleted
- Platform insights: registered users, expenses recorded, total expense value, expenses this month, spending per category, top 5 and bottom 5 categories by use, recently added expenses, recently registered users

## Technologies

- **Frontend:** React 19, TypeScript, Vite, Material UI, React Router, **React Context** (authentication, roles, protected routes), **Redux Toolkit** (search, filtering, sorting and pagination state), Axios
- **Backend:** Node.js, Express, TypeScript, Mongoose, Zod (validation), JSON Web Tokens, bcrypt
- **Database:** MongoDB Atlas
- **Hosting:** Vercel (frontend), Render (backend)

## Project structure

```
backend/    Express REST API (models, routes, middleware, seed script)
frontend/   React + TypeScript app (api, components, context, store, pages)
```

State management at a glance: `frontend/src/context/` holds the auth context and `frontend/src/store/filtersSlice.ts` holds the Redux filter state used by the Expenses page.

## Run it locally

You need Node.js 20 or newer and a MongoDB database (a free Atlas cluster works).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in the values below
npm run seed              # creates categories, demo data and the admin account (wipes existing data)
npm run dev               # http://localhost:5000
```

`backend/.env`:

| Variable        | Description                                              |
| --------------- | -------------------------------------------------------- |
| `PORT`          | Port for the API (default 5000)                          |
| `MONGODB_URI`   | MongoDB connection string, including the database name   |
| `JWT_SECRET`    | Long random string used to sign login tokens             |
| `CLIENT_URL`    | Allowed frontend origin(s), comma-separated              |
| `ADMIN_EMAIL`   | Email for the seeded admin (default admin@retain.app)    |
| `ADMIN_PASSWORD`| Password for the seeded admin (default Admin1234!)       |

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev               # http://localhost:5173
```

### Production builds

```bash
cd backend && npm run build && npm start
cd frontend && npm run build
```

## API reference

Base path: `/api`. Everything except register, login and health requires `Authorization: Bearer <token>`.

| Method | Endpoint                    | Access | Description                                            |
| ------ | --------------------------- | ------ | ------------------------------------------------------ |
| GET    | `/health`                   | Public | Health check                                           |
| POST   | `/auth/register`            | Public | Create a user account (role is always `user`)          |
| POST   | `/auth/login`               | Public | Sign in, returns a token and the user                  |
| GET    | `/auth/me`                  | User   | Current user                                           |
| GET    | `/expenses`                 | User   | List your expenses (filters and pagination below)      |
| GET    | `/expenses/:id`             | User   | One of your expenses                                   |
| POST   | `/expenses`                 | User   | Create an expense                                      |
| PUT    | `/expenses/:id`             | User   | Update an expense                                      |
| DELETE | `/expenses/:id`             | User   | Delete an expense                                      |
| GET    | `/budgets/:month`           | User   | Budget, spent, remaining and status for `YYYY-MM`      |
| PUT    | `/budgets/:month`           | User   | Set or update the budget for that month                |
| GET    | `/dashboard?month=YYYY-MM`  | User   | Dashboard summary for the month                        |
| GET    | `/categories`               | User   | List categories                                        |
| POST   | `/admin/categories`         | Admin  | Create a category                                      |
| PUT    | `/admin/categories/:id`     | Admin  | Rename a category                                      |
| DELETE | `/admin/categories/:id`     | Admin  | Delete a category (expenses move to Uncategorized)     |
| GET    | `/admin/insights`           | Admin  | Platform-wide insights                                 |

**`GET /expenses` query parameters:** `search`, `category` (id), `paymentMethod` (`cash`, `card`, `mobile_money`, `bank_transfer`), `from`, `to` (dates), `minAmount`, `maxAmount`, `sortBy` (`date` or `amount`), `order` (`asc` or `desc`), `page`, `limit`.

**Security:** passwords are hashed with bcrypt; every expense and budget query is scoped to the signed-in user's id; admin routes check the role on the server, not just in the UI; sign-up cannot create admins.

## Deployment notes

- **Backend (Render web service):** root directory `backend`, build command `npm install --include=dev && npm run build`, start command `npm start`. Set `MONGODB_URI`, `JWT_SECRET` and `CLIENT_URL` as environment variables.
- **Frontend (Vercel):** root directory `frontend`, framework preset Vite. Set `VITE_API_URL` to `<render-url>/api`. `vercel.json` rewrites all routes to `index.html` so page refreshes work.
- **Database:** MongoDB Atlas with network access allowed from anywhere. Run `npm run seed` once against the production database to create the categories, demo data and admin account.
