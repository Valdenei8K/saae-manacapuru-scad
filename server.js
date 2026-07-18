const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const DB_FILE = path.resolve(__dirname, 'data.db');
const db = new sqlite3.Database(DB_FILE);

// Initialize tables
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS equipment (id TEXT PRIMARY KEY, data TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS regions (id TEXT PRIMARY KEY, data TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS pipelines (id TEXT PRIMARY KEY, data TEXT)");
});

const app = express();
app.use(cors());
app.use(express.json());

// Helpers
function rowToJson(row) {
  try {
    return JSON.parse(row.data);
  } catch (e) {
    return null;
  }
}

// Equipment endpoints
app.get('/api/equipment', (req, res) => {
  db.all('SELECT data FROM equipment', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const data = rows.map(r => rowToJson(r)).filter(Boolean);
    res.json(data);
  });
});

app.put('/api/equipment/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const json = JSON.stringify(data);
  db.run('INSERT INTO equipment(id, data) VALUES(?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', [id, json], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true, id, data });
  });
});

// Regions endpoints
app.get('/api/regions', (req, res) => {
  db.all('SELECT data FROM regions', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const data = rows.map(r => rowToJson(r)).filter(Boolean);
    res.json(data);
  });
});

app.put('/api/regions/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const json = JSON.stringify(data);
  db.run('INSERT INTO regions(id, data) VALUES(?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', [id, json], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true, id, data });
  });
});

// Pipelines endpoints
app.get('/api/pipelines', (req, res) => {
  db.all('SELECT data FROM pipelines', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const data = rows.map(r => rowToJson(r)).filter(Boolean);
    res.json(data);
  });
});

app.put('/api/pipelines/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const json = JSON.stringify(data);
  db.run('INSERT INTO pipelines(id, data) VALUES(?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', [id, json], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true, id, data });
  });
});

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
