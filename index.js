const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const secret = process.env.SECRET_KEY || 'your-secret-key';

function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-ctr', secret);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

let users = [];

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  const user = {
    id: Date.now().toString(),
    name: encrypt(name),
    email: encrypt(email)
  };
  users.push(user);
  res.status(201).json(user);
});

app.get('/users', (_, res) => res.json(users));

app.get('/ping', (_, res) => res.send('pong'));
app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.get('/metrics', (_, res) => res.json({ users: users.length }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`User service running on ${PORT}`));
