# UMS Student Dashboard

University Management System dashboard with a lightweight Node backend for authentication, timetable, exams, lecturers, consultations, password changes, and shared course resources.

## What Is Included

- Static HTML dashboard pages for students and lecturers
- Node HTTP server with JSON-file persistence
- Token-based login/logout flow
- Backend-backed timetable, exams, dashboard, and lecturer pages
- Shared resources hub with lecturer upload support
- Password change endpoint
- Consultation booking endpoint

## Technical Alignment

This project is organized to match the required stack:

- Frontend: HTML pages, dedicated CSS, and JavaScript modules
- Backend: lightweight Node.js HTTP server with JSON-backed mock persistence
- Responsive design: mobile-first adjustments are included in the page layouts
- Version control: repository is structured for Git-based collaboration

## Project Structure

- `server.js`: backend server and API routes
- `data/db.json`: persisted application data
- `uploads/`: uploaded shared resource files
- `js/`: shared frontend scripts and page-specific API logic
- `css/`: page-specific stylesheets
- `*.html`: dashboard pages served by the backend

## Requirements

- Node.js 18+ recommended

## How To Run

1. Open a terminal in the project folder:

```powershell
cd c:\path\to\UMS-Student-Dashboard-main
```

2. Start the backend server:

```powershell
node server.js
```

3. Open the app in your browser:

```text
http://localhost:3000/login.html
```

## Important

- Do not open the HTML files directly with `file://`
- Do not use VS Code Live Server for login and API-backed pages
- The terminal running `node server.js` must stay open while the app is in use

## Demo Credentials

### Student

- ID: `0005678`
- Password: `student123`

### Lecturer

- ID: `LEC001`
- Password: `lecturer123`

## Available Backend Endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/forgot`
- `POST /api/users/password`
- `GET /api/dashboard`
- `GET /api/timetable`
- `GET /api/exams`
- `GET /api/lecturers`
- `POST /api/consultations`
- `GET /api/resources`
- `POST /api/resources`

## Shared Resources Behavior

- Students can browse and open/download shared materials
- Lecturers can upload new resources from `resources.html`
- Uploaded files are stored under `uploads/`
- Resource metadata is stored in `data/db.json`

## Notes For Collaborators

- This project currently uses a JSON file instead of a database
- Sessions are stored in `data/db.json`
- Passwords are migrated to hashed values automatically by `server.js`
- If you reset `data/db.json`, demo accounts and sample content may need to be restored
- If port `3000` is already in use, stop the existing process or change the port in `server.js`

## Quick Start For Contributors

```powershell
git clone https://github.com/Just-haqq/UMS-Student-Dashboard.git
cd UMS-Student-Dashboard
node server.js
```

Then open:

```text
http://localhost:3000/login.html
```
