import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import { google } from 'googleapis';
import db from './server/database.ts';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fitedge-super-secret-key';
const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());
  app.use(cookieParser());

  // Real-time tracking of active sessions
  const activeSocks = new Map<string, string>(); // socketId -> userId

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('auth', (token) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        activeSocks.set(socket.id, decoded.userId);
        socket.join(`user:${decoded.userId}`);
        console.log(`User ${decoded.userId} authenticated on socket ${socket.id}`);
      } catch (err) {
        console.log('Socket auth failed');
      }
    });

    socket.on('disconnect', () => {
      activeSocks.delete(socket.id);
      console.log('Client disconnected:', socket.id);
    });
  });

  // --- API Routes ---

  // Auth Routes
  app.post('/api/auth/signup', (req, res) => {
    const { email, password, name } = req.body;
    try {
      const id = randomUUID();
      const hash = bcrypt.hashSync(password, 10);
      db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(id, email, hash, name);
      const token = jwt.sign({ userId: id }, JWT_SECRET);
      res.json({ token, user: { id, email, name } });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (user && bcrypt.compareSync(password, user.password_hash)) {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  // Fitness Data Routes
  app.get('/api/fitness/summary', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const userId = decoded.userId;

      // Get latest metrics
      const metrics = db.prepare(`
        SELECT type, value, timestamp 
        FROM fitness_data 
        WHERE user_id = ? 
        AND timestamp > date('now', '-1 day')
        ORDER BY timestamp DESC
      `).all(userId) as any[];

      // Aggregates for dashboard
      const summary = {
        steps: metrics.filter(m => m.type === 'steps').reduce((acc, curr) => acc + curr.value, 0),
        calories: Math.round(metrics.filter(m => m.type === 'calories').reduce((acc, curr) => acc + curr.value, 0)),
        distance: Math.round(metrics.filter(m => m.type === 'distance').reduce((acc, curr) => acc + curr.value, 0) * 100) / 100,
        heartRate: metrics.find(m => m.type === 'heart_rate')?.value || 72,
        activeMinutes: metrics.filter(m => m.type === 'active_minutes').reduce((acc, curr) => acc + curr.value, 0)
      };

      res.json(summary);
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.get('/api/fitness/charts', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const userId = decoded.userId;

      const data = db.prepare(`
        SELECT strftime('%H:00', timestamp) as time, type, SUM(value) as total
        FROM fitness_data 
        WHERE user_id = ? AND timestamp > date('now', '-7 days')
        GROUP BY time, type
        ORDER BY time ASC
      `).all(userId) as any[];

      res.json(data);
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Google Fit OAuth Setup
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/auth/callback`
  );

  app.get('/api/auth/google/url', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.body.read',
        'https://www.googleapis.com/auth/fitness.location.read'
      ],
      prompt: 'consent'
    });
    res.json({ url });
  });

  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      // In a real app, we'd associate this with the logged-in user session
      // For this demo, we'll suggest storing it in the user's record
      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff;">
            <div style="text-align: center;">
              <h1>Connection Successful!</h1>
              <p>Your fitness data is being synced. You can close this window now.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
                  window.close();
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (err) {
      res.status(500).send('Authentication failed');
    }
  });

  // Simulation / Mock Data Generator for real-time vibe
  cron.schedule('*/30 * * * * *', () => {
    const users = db.prepare('SELECT id FROM users').all() as any[];
    users.forEach(user => {
      const heartRate = 60 + Math.random() * 40;
      const steps = Math.floor(Math.random() * 50);
      const calories = steps * 0.04;
      
      db.prepare('INSERT INTO fitness_data (user_id, type, value) VALUES (?, ?, ?)').run(user.id, 'heart_rate', heartRate);
      db.prepare('INSERT INTO fitness_data (user_id, type, value) VALUES (?, ?, ?)').run(user.id, 'steps', steps);
      db.prepare('INSERT INTO fitness_data (user_id, type, value) VALUES (?, ?, ?)').run(user.id, 'calories', calories);

      io.to(`user:${user.id}`).emit('fitness_update', {
        type: 'real_time',
        data: { heartRate, steps, calories }
      });
    });
  });

  // Goals Routes
  app.get('/api/fitness/goals', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const userId = decoded.userId;

      const goals = db.prepare('SELECT * FROM goals WHERE user_id = ?').all(userId);
      res.json(goals);
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.post('/api/fitness/goals', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const userId = decoded.userId;
      const { type, target, period } = req.body;

      // Upsert goal
      const existing = db.prepare('SELECT id FROM goals WHERE user_id = ? AND type = ?').get(userId, type) as any;
      
      if (existing) {
        db.prepare('UPDATE goals SET target = ?, period = ? WHERE id = ?').run(target, period, existing.id);
      } else {
        db.prepare('INSERT INTO goals (user_id, type, target, period) VALUES (?, ?, ?, ?)').run(userId, type, target, period);
      }

      res.json({ success: true });
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // User Profile Routes
  app.get('/api/user/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const userId = decoded.userId;

      const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(userId) as any;
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      res.json(user);
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.post('/api/user/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    const { name, email, weight, height } = req.body;

    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const userId = decoded.userId;

        db.prepare('UPDATE users SET name = ?, email = ?, weight = ?, height = ? WHERE id = ?').run(
          name || 'User', email, weight || 0, height || 0, userId
        );
        return res.json({ success: true, user: { id: userId, name, email, weight, height } });
      } catch (err) {
        // Fall through to unauthenticated logic if token is invalid
      }
    }

    // Unauthenticated / Persistence via email
    if (!email) return res.status(400).json({ error: 'Email required' });
    
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (user) {
      db.prepare('UPDATE users SET name = ?, weight = ?, height = ? WHERE id = ?').run(
        name || user.name, weight || user.weight, height || user.height, user.id
      );
    } else {
      const id = randomUUID();
      db.prepare('INSERT INTO users (id, email, name, weight, height) VALUES (?, ?, ?, ?, ?)').run(
        id, email, name || 'User', weight || 0, height || 0
      );
    }
    const updatedUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    res.json({ success: true, user: updatedUser });
  });

  // Physical data update for Angular compatibility
  app.post('/api/fitness/physical', (req, res) => {
    const { email, weight, height } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (user) {
      db.prepare('UPDATE users SET weight = ?, height = ? WHERE id = ?').run(weight || 0, height || 0, user.id);
    } else {
      const id = randomUUID();
      db.prepare('INSERT INTO users (id, email, name, weight, height) VALUES (?, ?, ?, ?, ?)').run(
        id, email, 'User', weight || 0, height || 0
      );
    }
    res.json({ success: true });
  });

  app.get('/api/fitness/recommendations', (req, res) => {
    const { email } = req.query;
    let weight = 0;
    let height = 0;

    if (email) {
      const user = db.prepare('SELECT weight, height FROM users WHERE email = ?').get(email) as any;
      if (user) {
        weight = user.weight;
        height = user.height;
      }
    }

    const recommendations = [];
    if (weight <= 0 || height <= 0) {
      recommendations.push(
        { name: "General Walking", type: "Cardio", intensity: "Low", duration: "30 mins", description: "A great way to start your fitness journey. Focus on consistency.", icon: "Footprints" },
        { name: "Basic Stretching", type: "Flexibility", intensity: "Low", duration: "15 mins", description: "Improve your range of motion and reduce muscle tension.", icon: "Activity" }
      );
    } else {
      const bmi = weight / ((height / 100) * (height / 100));
      if (bmi < 18.5) {
        recommendations.push(
          { name: "Progressive Strength Training", type: "Muscle Building", intensity: "Medium", duration: "45 mins", description: "Focus on compound movements to build lean muscle mass safely.", icon: "Zap" },
          { name: "Hatha Yoga", type: "Flexibility", intensity: "Low", duration: "30 mins", description: "Balance strength with flexibility. Great for recovery.", icon: "Moon" }
        );
      } else if (bmi < 25) {
        recommendations.push(
          { name: "Distance Running", type: "Cardio", intensity: "High", duration: "30 mins", description: "Maintain your cardiovascular health with steady-state running.", icon: "Footprints" },
          { name: "Advanced HIIT", type: "Metabolic", intensity: "High", duration: "20 mins", description: "Maximal effort intervals to boost your metabolism and power.", icon: "Flame" }
        );
      } else if (bmi < 30) {
        recommendations.push(
          { name: "Power Walking", type: "Cardio", intensity: "Medium", duration: "45 mins", description: "A higher intensity walk to burn fat without overstressing joints.", icon: "Footprints" },
          { name: "Leisure Swimming", type: "Full Body", intensity: "Medium", duration: "40 mins", description: "Utilize the resistance of water for a gentle but effective workout.", icon: "Heart" }
        );
      } else {
        recommendations.push(
          { name: "Aqua Aerobics", type: "Low Impact", intensity: "Low", duration: "30 mins", description: "Ideal for joint health and steady weight management.", icon: "Heart" },
          { name: "Indoor Cycling", type: "Cardio", intensity: "Low", duration: "30 mins", description: "Maintain fixed pace to improve cardiovascular efficiency.", icon: "Clock" }
        );
      }
    }
    res.json(recommendations);
  });

  app.get('/api/fitness/users', (req, res) => {
    const users = db.prepare('SELECT name, email FROM users').all();
    res.json(users);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
