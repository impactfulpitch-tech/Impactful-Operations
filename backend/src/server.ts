import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
// import projectRoutes from './routes/projects';
// import taskRoutes from './routes/tasks';
// import teamRoutes from './routes/team';
// import invoiceRoutes from './routes/invoices';
// import clientSheetRoutes from './routes/clientSheets';
// import activityLogRoutes from './routes/activityLog';
// import authRoutes from './routes/auth';
// import projectLinksRoutes from './routes/projectLinks';
import reportsRoutes from './routes/reports';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Welcome/Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Workflow Hub Backend API',
    version: '1.0.0',
    availableEndpoints: {
      health: 'GET /health - Server health check',
      auth: {
        register: 'POST /api/auth/register - Register new user',
        login: 'POST /api/auth/login - User login',
        me: 'GET /api/auth/me - Get current user',
      },
      projects: {
        list: 'GET /api/projects - Get all projects',
        create: 'POST /api/projects - Create new project',
        getOne: 'GET /api/projects/:id - Get project by ID',
        update: 'PUT /api/projects/:id - Update project',
        delete: 'DELETE /api/projects/:id - Delete project',
      },
      projectLinks: {
        list: 'GET /api/projects/:projectId/links - Get project links',
        create: 'POST /api/projects/:projectId/links - Add link to project',
        update: 'PUT /api/projects/:projectId/links/:linkId - Update link',
        delete: 'DELETE /api/projects/:projectId/links/:linkId - Delete link',
        chatgpt: 'GET /api/projects/:projectId/links/chatgpt - Get ChatGPT links only',
      },
      tasks: {
        list: 'GET /api/tasks - Get all tasks',
        create: 'POST /api/tasks - Create new task',
        getOne: 'GET /api/tasks/:id - Get task by ID',
        update: 'PUT /api/tasks/:id - Update task',
        delete: 'DELETE /api/tasks/:id - Delete task',
      },
      team: {
        list: 'GET /api/team - Get all team members',
        create: 'POST /api/team - Create team member',
        getOne: 'GET /api/team/:id - Get team member by ID',
        update: 'PUT /api/team/:id - Update team member',
        delete: 'DELETE /api/team/:id - Delete team member',
      },
      invoices: {
        list: 'GET /api/invoices - Get all invoices',
        create: 'POST /api/invoices - Create invoice',
        getOne: 'GET /api/invoices/:id - Get invoice by ID',
        update: 'PUT /api/invoices/:id - Update invoice',
        delete: 'DELETE /api/invoices/:id - Delete invoice',
      },
      clients: {
        list: 'GET /api/clients - Get all client records',
        create: 'POST /api/clients - Create client record',
        update: 'PUT /api/clients/:id - Update client record',
        delete: 'DELETE /api/clients/:id - Delete client record',
      },
      activity: {
        list: 'GET /api/activity - Get activity logs',
        create: 'POST /api/activity - Log activity',
      },
    },
    frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
    database: 'Connected to Neon PostgreSQL',
  });
});

// API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/projects', projectLinksRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/team', teamRoutes);
// app.use('/api/invoices', invoiceRoutes);
// app.use('/api/clients', clientSheetRoutes);
// app.use('/api/activity', activityLogRoutes);
app.use('/api/reports', reportsRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connection successful');

    app.listen(port, () => {
      console.log(`\n🚀 Server is running at http://localhost:${port}`);
      console.log(`📊 Frontend: ${process.env.FRONTEND_URL}`);
      console.log(`🗄️  Database: Connected to Neon\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
