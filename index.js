const express = require('express');
const app = express();
app.use(express.json());

let users = [];

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  const user = { id: Date.now().toString(), name, email };
  users.push(user);
  res.status(201).json(user);
});

app.get('/users', (_, res) => res.json(users));
app.get('/metrics', (_, res) => res.json({ users: users.length }));
app.get('/health', (_, res) => res.send('ok'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Users service running on ${PORT}`));
