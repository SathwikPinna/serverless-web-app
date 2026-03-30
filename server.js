const express = require('express');
const path = require('path');

const tasksHandler = require('./api/tasks');

const app = express();

app.use(express.json());

// Mount the Vercel-style function at /api/tasks
app.all('/api/tasks', (req, res) => tasksHandler(req, res));

// Serve static frontend files from the project root
app.use(express.static(path.join(__dirname, '/')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});
