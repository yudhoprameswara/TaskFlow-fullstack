import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

// ─── Swagger / OpenAPI ────────────────────────────────────────────────────────

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description:
        'RESTful API for the Task Management System built with Express.js and TypeScript',
      contact: {
        name: 'API Support',
        email: 'support@taskmanager.dev',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-render-app-url.onrender.com' // User should update this or use a generic one
          : `http://localhost:${process.env.PORT ?? 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // In production, the files are .js in the dist folder. In development, they are .ts in the src folder.
  apis: [
    process.env.NODE_ENV === 'production' 
      ? './dist/routes/*.js' 
      : './src/routes/*.ts'
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Docs ─────────────────────────────────────────────────────────────────

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '5000', 10);

const startServer = async (): Promise<void> => {
  // Load environment variables
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    // Fallback to current working directory
    dotenv.config();
  }

  // Check critical environment variables
  if (!process.env.MONGODB_URI) {
    console.error('❌ FATAL ERROR: MONGODB_URI is not defined in environment variables.');
    console.error(`📂 Current Working Directory: ${process.cwd()}`);
    console.error(`📄 Searching for .env at: ${envPath}`);
    console.error('👉 Please set MONGODB_URI in your .env file or Render Dashboard (Environment tab).');
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.warn('⚠️ WARNING: JWT_SECRET is not defined. Authentication will fail.');
  }

  await connectDB();

  const host = '0.0.0.0'; // Bind to all interfaces for cloud deployment
  app.listen(PORT, host, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📡 Listening on http://${host}:${PORT}`);
    console.log(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
  });
};

startServer();

export default app; // Export for testing
