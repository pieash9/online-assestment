# Online Assessment Platform

Online exam system with two applications:

- Frontend: Next.js (App Router) + React Query + Redux + shadcn/ui
- Server: Express + Prisma + MySQL

---

## Live Demo

🔗 **[Live Demo](https://online-assestment-chi.vercel.app)**

> *Note: Use the seeded users to explore both employer and candidate journeys.*


## Video Demo

🔗 **[Video Demo](https://drive.google.com/file/d/1sl7yKKc8IeZ-TTjtmrki0iRmsR_o7hQG/view?usp=sharing)**

---

## Credentials for Testing
- **Employer**
	- Email: employer@example.com
	- Password: Password123!
- **Candidate 1**
	- Email: candidate1@example.com
	- Password: Password123!
- **Candidate 2**
	- Email: candidate2@example.com
	- Password: Password123!

## MCP Integration

Yes, I have worked with **Model Context Protocol (MCP)**—specifically, the **Figma MCP** for design collaboration and prototyping. I used it to:
- **Streamline the design-to-development workflow** by extracting assets, styles, and components directly from Figma designs.
- **Automate repetitive tasks** like generating UI components, syncing design tokens, and ensuring pixel-perfect translations from design to code.
- **Collaborate in real-time** with designers, reducing miscommunication and speeding up iteration cycles.

**What I accomplished:**
- Reduced manual effort in translating Figma designs to React/Next.js components.
- Improved consistency in UI by auto-generating Tailwind CSS classes and shadcn/ui components.
- Saved hours of manual work by automating the extraction of design system elements.

---

## AI Tools for Development

I regularly use **AI-powered tools** to supercharge my frontend development workflow:

- **GitHub Copilot**: My go-to for writing boilerplate code, debugging, and generating React hooks, API calls etc.
- **ChatGPT + Codex**: Used for brainstorming, writing complex logic, and optimizing performance. For example, I’ve used it to:
  - Generate TypeScript interfaces for API responses.
  - Optimize Redux selectors and Redux Toolkit slices.

---

## Offline Mode for Exam Platform

Handling **offline mode** is critical for an exam platform, especially to ensure candidates aren’t penalized for losing connectivity. Here’s how I’d approach it:

### **1. Local Caching of Exam Data**
- Use **IndexedDB** or **Service Workers** to cache exam questions, instructions, and candidate progress locally.
- Store answers and attempt metadata in the browser’s IndexedDB, so they persist even if the user refreshes or loses connectivity.

### **2. Auto-Save and Queue Requests**
- Implement an **auto-save mechanism** that saves answers to IndexedDB every few seconds.
- Queue API requests (e.g., submitting answers) when offline and **sync them automatically** when the connection is restored.

### **3. Conflict Resolution**
- Use **versioning** or timestamps to handle conflicts if the same answer is saved both online and offline.
- Show a **clear notification** to the candidate when their answers have been synced.

### **4. Progress Tracking**
- Display a **synchronization status** (e.g., “Pending: 3 answers not yet synced”).
- Warn the candidate if they try to submit without a stable connection.

### **5. Progressive Web App (PWA) Approach**
- Convert the frontend into a **PWA** to leverage:
  - **Offline-first architecture**.
  - **Background sync** for queued requests.
  - **App-like experience** with installability.

---

## Project Structure

- frontend: Candidate and employer web app
- server: REST API, auth, exam management, candidate attempts

## Core Features

- Authentication with role-based access (Employer, Candidate)
- Employer exam management:
	- Create exam metadata
	- Add/update/delete questions
	- Assign candidates and view candidate list/status
- Candidate test flow:
	- List assigned exams
	- Start exam attempt
	- One-question-at-a-time answering (RADIO, CHECKBOX, TEXT)
	- Save and submit attempt
	- Auto-submit on timeout
	- Behavioral tracking (tab switch and fullscreen exit)
- Standardized API response envelope:
	- success, message, data

## Tech Stack

- Frontend:
	- Next.js 16
	- React 19
	- TypeScript
	- Tailwind CSS
	- @tanstack/react-query
	- Redux Toolkit
	- TipTap (rich text)
- Server:
	- Express 5
	- Prisma 7
	- MySQL / MariaDB
	- Zod validation
	- JWT auth (httpOnly cookie)

## Prerequisites

- Node.js 20+
- npm or yarn
- MySQL/MariaDB running locally

## Environment Setup

### 1) Server environment

Copy file:

- from server/.env.example
- to server/.env

Required variables:

- DATABASE_URL
- JWT_SECRET
- PORT (default 8080)
- NODE_ENV
- CLIENT_ORIGIN (frontend URL, default http://localhost:3000)

Example DATABASE_URL:

mysql://root:password@localhost:3306/online_assessment_platform

### 2) Frontend environment

Copy file:

- from frontend/.env.example
- to frontend/.env.local

Required variable:

- NEXT_PUBLIC_SERVER_BASE_URL=http://localhost:8080

## Local Installation

From project root, install each app dependencies:

1. cd server && npm install
2. cd ../frontend && npm install

## Database Initialization

From server directory:

1. npm run prisma:migrate
2. npm run prisma:generate
3. npm run prisma:seed

Seed creates test users:

- Employer:
	- email: employer@example.com
	- password: Password123!
- Candidate 1:
	- email: candidate1@example.com
	- password: Password123!
- Candidate 2:
	- email: candidate2@example.com
	- password: Password123!

## Run Locally

Run in two terminals.

### Terminal A (API)

1. cd server
2. npm run dev

Server starts at:

- http://localhost:8080

Health check:

- GET http://localhost:8080/api/health

### Terminal B (Frontend)

1. cd frontend
2. npm run dev

Frontend starts at:

- http://localhost:3000

## Build Commands

- Frontend:
	- cd frontend && npm run build
	- cd frontend && npm run lint
- Server:
	- cd server && npm run build
	- cd server && npm run start

## API Overview

Base URL: http://localhost:8080/api

Auth is cookie-based JWT. Protected routes require authenticated cookie and matching role.

### Health

- GET /health
	- Public
	- Returns API health status

### Auth

- POST /auth/login
	- Public
	- Body:
		- email: string (email)
		- password: string (min 6)
	- Sets auth cookie

- POST /auth/logout
	- Public
	- Clears auth cookie

- GET /auth/me
	- Protected
	- Returns current authenticated user

### Employer Endpoints (Role: EMPLOYER)

- GET /employer/exams
	- List employer exams

- POST /employer/exams
	- Create exam
	- Body:
		- title: string
		- totalCandidates: number
		- totalSlots: number
		- questionSets: number
		- questionType: string
		- startTime: ISO datetime string
		- endTime: ISO datetime string
		- durationMinutes: number
		- negativeMarking: number (optional, default 0)

- GET /employer/exams/:id
	- Get exam details

- PUT /employer/exams/:id
	- Update exam
	- Body same as create exam

- POST /employer/exams/:id/questions
	- Add question
	- Body:
		- title: string
		- type: CHECKBOX | RADIO | TEXT
		- options: Array<{ label: string, isCorrect?: boolean }>

- GET /employer/exams/:id/candidates
	- List assigned candidates for exam

- PUT /employer/questions/:id
	- Update question
	- Body:
		- title: string
		- type: CHECKBOX | RADIO | TEXT
		- options: Array<{ label: string, isCorrect?: boolean }>

- DELETE /employer/questions/:id
	- Delete question

### Candidate Endpoints (Role: CANDIDATE)

- GET /candidate/exams
	- List assigned exams

- POST /candidate/exams/:id/start
	- Start exam attempt

- GET /candidate/attempts/:attemptId
	- Get attempt questions and saved answers

- POST /candidate/attempts/:attemptId/answer
	- Save answer
	- Body:
		- questionId: string
		- textAnswer?: string
		- selectedOptionIds?: string[]

- POST /candidate/attempts/:attemptId/behavior
	- Track proctoring behavior
	- Body:
		- eventType: TAB_SWITCH | FULLSCREEN_EXIT

- POST /candidate/attempts/:attemptId/submit
	- Submit attempt
	- Body:
		- autoSubmitted?: boolean

## Notes

- Keep frontend and backend URLs aligned:
	- CLIENT_ORIGIN in server/.env
	- NEXT_PUBLIC_SERVER_BASE_URL in frontend/.env.local
- Use seed users to verify both employer and candidate journeys quickly.
