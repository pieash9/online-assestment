# Server Documentation

This service is the Express + Prisma API for the Online Assessment Platform.

For complete monorepo documentation (frontend + server + full API list), see:

- ../Redme.md

## Quick Start (Server Only)

1. Copy environment file:
	- from .env.example
	- to .env
2. Install dependencies:
	- npm install
3. Prepare database:
	- npm run prisma:migrate
	- npm run prisma:generate
	- npm run prisma:seed
4. Run development server:
	- npm run dev

Server default URL:

- http://localhost:8080

Health endpoint:

- GET /api/health

## Main Route Groups

- /api/auth
- /api/employer
- /api/candidate

## Response Envelope

All endpoints follow:

- success: boolean
- message: string
- data: any
