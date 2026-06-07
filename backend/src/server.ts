import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/db.js';
import { requestLogger, logger } from './middleware/logger.js';

// Load environmental variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configurations
app.use(cors({
  origin: '*', // Allow connections from frontend dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use(requestLogger);

// API Router mappings
import authRouter, { seedDefaultUser } from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import analysisRouter from './routes/analysis.js';
import chatRouter from './routes/chat.js';
import docsRouter from './routes/docs.js';
import testsRouter from './routes/tests.js';
import refactorRouter from './routes/refactor.js';
import visualizeRouter from './routes/visualize.js';
import resumeRouter from './routes/resume.js';
import searchRouter from './routes/search.js';
import apiAliasRouter from './routes/apiAlias.js';

app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/projects', searchRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/chat', chatRouter);
app.use('/api/docs', docsRouter);
app.use('/api/tests', testsRouter);
app.use('/api/refactor', refactorRouter);
app.use('/api/visualize', visualizeRouter);
app.use('/api/resume', resumeRouter);
app.use('/', apiAliasRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled Server Error: %s', err.stack || err.message || err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Decoupled async startup sequence
async function startServer() {
  try {
    // Initialize DB schema
    await initializeDatabase();
    // Seed default user
    await seedDefaultUser();

    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        logger.info(`=============================================`);
        logger.info(` AI Engineering Workshop Backend Listening   `);
        logger.info(` Port: http://localhost:${PORT}             `);
        logger.info(`=============================================`);
      });
    }
  } catch (error) {
    logger.error('Server startup failed: %o', error);
    process.exit(1);
  }
}

// Invoke startServer
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };

