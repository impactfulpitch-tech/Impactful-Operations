# Render Deployment Guide

This guide will help you deploy the Workflow Hub application to Render.

## Prerequisites

- GitHub account with this repository pushed
- Render account (free tier available)
- Neon PostgreSQL database (already configured in `.env`)

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Connect Your GitHub Repository to Render

1. Go to [render.com](https://render.com)
2. Sign up/Log in with your GitHub account
3. Click **New** > **Blueprint**
4. Select your repository containing this project
5. Render will automatically detect the `render.yaml` file

### 3. Configure Environment Variables

Before deploying, set these environment variables in Render:

#### Backend Service Variables:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
  - Example: `postgresql://neondb_owner:...@ep-spring-unit-ain0hrpu-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- `JWT_SECRET`: A strong secret key for JWT authentication
  - Example: `your-super-secret-jwt-key-min-32-characters`
- `FRONTEND_URL`: The URL of your deployed frontend
  - Will be something like: `https://workflow-hub-frontend.onrender.com`

#### Frontend Service Variables:
- `VITE_API_URL`: The URL of your deployed backend API
  - Will be something like: `https://workflow-hub-backend.onrender.com`

### 4. Configure Services

The `render.yaml` file defines two services:

#### Backend (Node.js API)
- Runtime: Node.js 20
- Build: `cd backend && npm install && npm run build && npx prisma db push`
- Start: `cd backend && node dist/server.js`
- Port: 5000

#### Frontend (Static Site)
- Build: `cd frontend && npm install && npm run build`
- Publish path: `frontend/dist`
- Routes: All paths redirect to index.html (SPA support)

### 5. Deploy

1. Click **Deploy** in the Render dashboard
2. Render will:
   - Clone your repository
   - Install dependencies
   - Build your code
   - Push database schema to Neon
   - Start your services

The deployment typically takes 5-10 minutes.

### 6. Update Frontend API URL

After backend is deployed:

1. Copy your backend service URL from Render (e.g., `https://workflow-hub-backend.onrender.com`)
2. Update `frontend/.env`:
   ```
   VITE_API_URL=https://workflow-hub-backend.onrender.com
   ```
3. Commit and push - the frontend will redeploy automatically

## Environment Variables Setup

### Backend .env (Render Dashboard)

```
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=your-strong-secret-key-here
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### Frontend .env (In Repository)

```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_ENV=production
```

## Database Migrations

The Prisma migrations run automatically during build:
```bash
npx prisma db push --skip-generate
```

This happens in the build command, so no manual migration steps needed.

## Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` is correct
- Verify Neon database is active
- Check database credentials

### Build Failures
- Check build logs in Render dashboard
- Ensure `dist` folder is generated correctly
- Verify all environment variables are set

### Frontend Not Connecting to Backend
- Check `VITE_API_URL` is set correctly
- Check CORS settings in backend (`FRONTEND_URL`)
- Verify both services are running

### Port Issues
- Backend uses port 5000 (automatically assigned by Render)
- Frontend is served as static files
- Don't hardcode localhost

## Useful Commands for Local Testing

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Build both services
cd backend && npm run build
cd ../frontend && npm run build

# Test locally
cd backend && npm start
# In another terminal:
cd frontend && npm preview
```

## Manual Redeployment

If you need to redeploy:

1. Make your changes
2. Commit and push to main
3. Render automatically redeploys on push (if autoDeploy is enabled)

## SSL/HTTPS

Render automatically provides SSL certificates for all deployed services. Your app will be accessible via HTTPS.

## Performance

- **Frontend**: Served as static files (fast)
- **Backend**: Node.js on free tier (may have cold starts)
- **Database**: Neon PostgreSQL (serverless)

## Next Steps

1. Test all API endpoints
2. Verify database operations work
3. Test user authentication
4. Monitor application logs in Render dashboard

For more help, visit [Render Docs](https://render.com/docs)
