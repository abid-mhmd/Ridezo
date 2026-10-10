# Ridezo 🚗

Ridezo is a peer-to-peer carpooling and ride-sharing web application that helps users find and offer rides conveniently.

Users can act as both drivers and passengers, making it easier to share journeys and travel together.

## Tech Stack

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS

### Backend

* NestJS
* Node.js
* TypeScript
* MongoDB
* Mongoose
* Redis

### Tools

* Git & GitHub
* ESLint
* Prettier
* Pino

## Features

* User registration and authentication
* Email OTP verification
* User profile management
* Ride creation and discovery
* Ride booking and management
* Real-time messaging
* Notifications
* Admin user management
* Safety features

## Project Structure

```text
Ridezo/
├── backend/    # NestJS backend
├── frontend/        # React frontend
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

* Node.js
* npm
* MongoDB Atlas account

### Backend Setup

```bash
cd backend-nest
npm install
npm run start:dev
```

The backend runs at:

`http://localhost:3000`

API prefix:

`/api`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Follow the URL displayed in your terminal to open the frontend.

## Environment Variables

Create a `.env` file in the appropriate application directory and configure the required environment variables.

Refer to `.env.example` for the expected configuration.

**Never commit secrets or credentials to GitHub.**

## Development Status

Ridezo is currently under development. Features will be implemented incrementally, with a focus on maintainable architecture, security, and practical software development principles.


