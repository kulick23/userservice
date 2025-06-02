const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const secret = process.env.ENCRYPTION_SECRET || 'default-secret';

function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-ctr', secret);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

let users = [];

app.post('/users', (req, res) => {
  const { id, name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing name or email' });
  }

  const user = {
    id: id || Date.now().toString(), // 👉 используем переданный id, если есть
    name: encrypt(name),
    email: encrypt(email)
  };

  users.push(user);
  res.status(201).json(user);
});

app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.get('/users', (_, res) => res.json(users));

app.get('/ping', (_, res) => res.send('pong'));
app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.get('/metrics', (_, res) => res.json({ users: users.length }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`User service running on ${PORT}`));
