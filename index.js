require('dotenv').config();
const { MongoClient } = require('mongodb');
const client = require('prom-client');

const mongoUrl = process.env.MONGO_URL;
let db;

MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
db = client.db('charity');
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const secret = process.env.ENCRYPTION_SECRET || 'default-secret';

function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-ctr', secret);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

app.post('/users', async (req, res) => {
  const { id, name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing name or email' });
  }

  const user = {
    id: id || Date.now().toString(),
    name: encrypt(name),
    email: encrypt(email)
  };

  // сохраняем в MongoDB
  await db.collection('users').insertOne(user);
  res.status(201).json(user);
});

app.get('/users/:id', async (req, res) => {
  // ищем в MongoDB
  const user = await db.collection('users').findOne({ id: req.params.id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.get('/users', async (_, res) => {
  // возвращаем всех из MongoDB
  const users = await db.collection('users').find().toArray();
  res.json(users);
});

app.get('/ping', (_, res) => res.send('pong'));
app.get('/health', (_, res) => res.json({ status: 'ok' }));

client.collectDefaultMetrics();           // сбор дефолтных метрик
const usersGauge = new client.Gauge({     // метрика число пользователей
  name: 'users_count',
  help: 'Number of users in MongoDB'
});

app.get("/metrics", async (_, res) => {
  const count = await db.collection('users').countDocuments();
  usersGauge.set(count);
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`User service running on ${PORT}`));
