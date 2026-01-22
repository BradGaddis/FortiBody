const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let appConnected = false;
let appExercises = [];
const adminClients = new Set();

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const readData = (filename) => {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    return [];
  }
  const data = fs.readFileSync(filepath, 'utf-8');
  return data ? JSON.parse(data) : [];
};

const writeData = (filename, data) => {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
};

const broadcast = (type, payload) => {
  const message = JSON.stringify({ type, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const broadcastToAdmins = (type, payload) => {
  const message = JSON.stringify({ type, payload });
  adminClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const ENTITIES = {
  exercises: 'exercises.json',
  routines: 'routines.json',
  modules: 'modules.json'
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/status', (req, res) => {
  res.json({ appConnected });
});

Object.entries(ENTITIES).forEach(([entity, filename]) => {
  const filepath = path.join(DATA_DIR, filename);

  app.get(`/api/${entity}`, (req, res) => {
    const data = readData(filename);
    res.json(data);
  });

  app.post(`/api/${entity}`, (req, res) => {
    const data = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Data must be an array' });
    }
    writeData(filename, data);
    broadcast(`${entity}_updated`, data);
    res.json({ success: true, count: data.length });
  });

  app.post(`/api/${entity}/add`, (req, res) => {
    const items = readData(filename);
    const newItem = { ...req.body, id: Date.now().toString() };
    items.push(newItem);
    writeData(filename, items);
    broadcast(`${entity}_updated`, items);
    res.json({ success: true, item: newItem });
  });

  app.put(`/api/${entity}/:id`, (req, res) => {
    const items = readData(filename);
    const index = items.findIndex((item) => item.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    items[index] = { ...items[index], ...req.body };
    writeData(filename, items);
    broadcast(`${entity}_updated`, items);
    res.json({ success: true, item: items[index] });
  });

  app.delete(`/api/${entity}/:id`, (req, res) => {
    const items = readData(filename);
    const filtered = items.filter((item) => item.id !== req.params.id);
    writeData(filename, filtered);
    broadcast(`${entity}_updated`, filtered);
    res.json({ success: true });
  });
});

app.get('/api/export/:entity/:id', (req, res) => {
  const items = readData(ENTITIES[req.params.entity]);
  const item = items.find((i) => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (message.type === 'identify') {
        if (message.role === 'app') {
          appConnected = true;
          appExercises = message.exercises || [];
          console.log('App connected with', appExercises.length, 'exercises');
          broadcastToAdmins('app_status', { connected: true, exercises: appExercises });
        } else if (message.role === 'admin') {
          adminClients.add(ws);
          console.log('Admin client registered');
          ws.send(JSON.stringify({ type: 'app_status', payload: { connected: appConnected, exercises: appExercises } }));
        }
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  });

  ws.on('close', () => {
    if (adminClients.has(ws)) {
      adminClients.delete(ws);
      console.log('Admin client disconnected');
    }
    if (appConnected) {
      appConnected = false;
      console.log('App disconnected');
      broadcastToAdmins('app_status', { connected: false });
    }
  });
});

ensureDataDir();

['exercises.json', 'routines.json', 'modules.json'].forEach((file) => {
  const filepath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '[]');
  }
});

server.listen(PORT, () => {
  console.log(`Admin server running on http://localhost:${PORT}`);
});
