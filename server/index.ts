import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, realpathSync } from 'fs';
import { setupCronJobs } from './jobs/scheduler.js';
import newsletterRoutes from './routes/newsletter.js';
import summaryRoutes from './routes/summary.js';
import configRoutes from './routes/config.js';
import logRoutes from './routes/logs.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findDistPath(): string {
  // Resolve symlinks to get the real path
  let basePath: string;
  try {
    basePath = realpathSync(process.cwd());
  } catch {
    basePath = process.cwd();
  }

  const possiblePaths = [
    path.resolve(basePath, 'dist'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(__dirname, '../dist'),
    path.resolve(__dirname, '../../dist'),
  ];

  for (const distPath of possiblePaths) {
    const indexPath = path.join(distPath, 'index.html');
    if (existsSync(indexPath)) {
      console.log(`Found dist at: ${distPath}`);
      return distPath;
    }
  }

  console.warn('Could not find dist folder with index.html. Checked paths:', possiblePaths);
  return possiblePaths[0];
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/newsletters', newsletterRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/config', configRoutes);
app.use('/api/logs', logRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const distPath = findDistPath();
console.log(`Serving static files from: ${distPath}`);
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    next();
  }
});

setupCronJobs();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Working directory: ${process.cwd()}`);
});
