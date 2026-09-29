// app.js
//
// This is the main entry point of the Express server.
// Its only job is to:
//   1. Load environment variables from .env.
//   2. Connect to MongoDB.
//   3. Create the Express app.
//   4. Plug in our routes.
//   5. Plug in the error handler.
//   6. Start listening for requests (when run directly).
//
// All the actual routing/graph logic lives elsewhere (Parts 1 and 2).
// This file just wires the HTTP layer (and now the database) on top of it.

// This MUST run before anything else that reads process.env.* - it reads
// the .env file in the project root and copies its values into
// process.env, so process.env.MONGODB_URI becomes available everywhere.
require('dotenv').config();

const express = require('express');

const routeRoutes = require('./routes/routeRoutes');
const historyRoutes = require('./routes/historyRoutes');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');

// Try to connect to MongoDB as soon as the app starts.
// This runs in the background - it does NOT stop the rest of the app
// from working. If MongoDB is not available, connectDB() logs a clear
// error and the route-finding feature keeps working normally, since
// Dijkstra never depends on MongoDB.
connectDB();

const app = express();

// A simple health-check route. Visiting http://localhost:5000/ should
// confirm the server is alive, without needing any query parameters.
app.get('/', (req, res) => {
  res.json({ message: 'Delhi Metro Route Optimizer API is running.' });
});

// Every route defined inside routeRoutes.js / historyRoutes.js will be
// prefixed with /api. So router.get('/route', ...) becomes GET /api/route,
// and router.get('/history', ...) becomes GET /api/history.
app.use('/api', routeRoutes);
app.use('/api', historyRoutes);

// The error handler must be registered AFTER all routes.
// Express only treats a 4-argument function as an error handler,
// and it only gets used if a route calls next(err) or an async route
// handler throws/rejects.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// require.main === module is true only when this file is run directly
// (e.g. "node src/app.js"). When this file is instead imported by a
// test file (using supertest), we do NOT want to actually start a real
// server and occupy a port - we just want the `app` object itself.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Delhi Metro Route Optimizer API running on http://localhost:${PORT}`);
  });
}

module.exports = app;