import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/db.js';

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

// Initialize DB schema
await initializeDatabase();

// API Router mappings
import authRouter, { seedDefaultUser } from './routes/auth.js';
await seedDefaultUser();
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
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Bind server port
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(` AI Engineering Workshop Backend Listening   `);
    console.log(` Port: http://localhost:${PORT}             `);
    console.log(`=============================================`);
  });
}

export { app };
