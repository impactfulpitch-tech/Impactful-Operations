# Workflow Hub - HR Management System

This project is structured for easy deployment with separate frontend and backend folders.

## 📁 Project Structure

```
workflow-hub-main/
├── frontend/          # React + Vite frontend application
├── backend/           # Node.js backend application
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## 🚀 Getting Started

### Frontend Setup

The frontend is built with React, TypeScript, Vite, and Tailwind CSS.

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

**Frontend runs on:** `http://localhost:5173` (default Vite port)

### Backend Setup

The backend is built with Node.js, Express, and Prisma.

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run Prisma migrations
npx prisma migrate dev

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Backend runs on:** `http://localhost:3000` (check backend configuration)

## 📦 Deployment

### Frontend Deployment

The frontend can be deployed to:
- **Vercel**: Connect your GitHub repo and select the `frontend` folder
- **Netlify**: Build command: `npm run build`, Publish directory: `frontend/dist`
- **GitHub Pages**: Use `npm run build` and deploy the `dist` folder

### Backend Deployment

The backend can be deployed to:
- **Heroku**: Deploy the `backend` folder
- **Railway**: Connect your GitHub repo and select the `backend` folder
- **DigitalOcean**: Deploy using Docker or directly
- **AWS/GCP**: Use their respective deployment services

## 🛠️ Development Workflow

1. **Start Backend**: Open a terminal, navigate to `backend/`, run `npm run dev`
2. **Start Frontend**: Open another terminal, navigate to `frontend/`, run `npm run dev`
3. **Make Changes**: Edit files in respective folders
4. **Test**: Run tests in both frontend and backend
5. **Commit**: Use git to commit your changes

## 📝 Environment Variables

### Frontend (.env in frontend folder)
```
VITE_API_URL=http://localhost:3000
```

### Backend (.env in backend folder)
```
DATABASE_URL="your-database-connection-string"
JWT_SECRET="your-secret-key"
PORT=3000
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests (if configured)
cd backend && npm test
```

## 📄 License

This project is private and proprietary.

## 👥 Contributors

Your team members here.

---

**Note**: Make sure to install dependencies in both `frontend/` and `backend/` folders before running the application.
