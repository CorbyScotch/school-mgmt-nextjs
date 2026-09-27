# SchoolFlow

SchoolFlow is a Ghanaian basic-school management system built with Next.js and MongoDB. It supports school setup, admissions, class management, attendance, fees, academic results, and report cards.

## Features

- Admin and role-based access control
- Student, teacher, class, subject, and fee management
- Attendance entry and monitoring
- Exam and result tracking
- Report card generation per academic term
- Dashboard summaries for operations and finance
- Security headers and request throttling on auth flows

## Tech stack

- Next.js 16
- React 19
- MongoDB with Mongoose
- JWT-based authentication
- App Router API routes

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file from the example:

```bash
copy .env.example .env.local
```

3. Update your environment values:

- `MONGODB_URI` with your MongoDB connection string
- `JWT_SECRET` with a minimum 32-character secret
- `INITIAL_ADMIN_SETUP_KEY` with a secure bootstrap key
- `APP_URL` with your local app URL

4. Run the app:

```bash
npm run dev
```

5. Open http://localhost:3000

## Initial admin setup

Use the admin bootstrapping endpoint to create the first school administrator:

```bash
POST /api/setup/admin
```

Payload:

```json
{
  "setupKey": "your-setup-key",
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@schoolflow.local",
  "dob": "1990-01-01",
  "gender": "male",
  "password": "StrongPass123"
}
```

## Production deployment checklist

- Set `NODE_ENV=production`
- Use a strong MongoDB connection URL and dedicated database user
- Use a long, unique `JWT_SECRET`
- Set `INITIAL_ADMIN_SETUP_KEY` to a secret setup value
- Use HTTPS in production
- Set `APP_URL` to the live public domain
- Configure external monitoring and backups
- Keep admin setup key out of source control

## Health check

The app exposes a readiness endpoint:

```bash
GET /api/health
```

This returns the current application health and database connection status.

## Common scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
```

## Docker deployment

Build and run the app in a container:

```bash
docker build -t schoolflow .
docker run --rm -p 3000:3000 --env-file .env.local schoolflow
```

The Docker image uses a standalone Next.js build and includes a health check against `/api/health`.

## Vercel deployment

For a hosted deployment, set these environment variables in Vercel:

- `MONGODB_URI`
- `JWT_SECRET`
- `INITIAL_ADMIN_SETUP_KEY`
- `APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NODE_ENV=production`

Then deploy the repository directly from GitHub.

## Notes

This is designed as a production-minded school management platform for a Ghanaian basic-school environment and follows the school calendar, term, class, attendance, fees, academic result, and report-card workflows described in the project documentation.
