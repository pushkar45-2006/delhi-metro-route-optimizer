// db.js
//
// Connects our Express app to MongoDB using Mongoose.
//
// The flow is exactly this simple:
//
//   require mongoose
//        |
//        v
//   read MONGODB_URI from .env
//        |
//        v
//   mongoose.connect()
//
// WHY WE DO THIS HERE (and not in every file that needs the database):
// This is the ONE place in the whole project that knows how to connect
// to MongoDB. Every model (like SearchHistory) just assumes a connection
// already exists, or will exist soon.

const mongoose = require('mongoose');

// By default, Mongoose "buffers" (queues up) database operations if the
// connection isn't ready yet, and waits up to 10 seconds before giving
// up. For this simple project, we'd rather fail FAST and clearly if the
// database isn't connected, instead of every request silently hanging.
mongoose.set('bufferCommands', false);

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  // If the environment variable was never set, there is nothing to
  // connect to. We log a clear message and simply return - we do NOT
  // crash the whole app, because the route-finding feature (Dijkstra)
  // does not depend on MongoDB at all.
  if (!mongoUri) {
    console.error('MONGODB_URI is not set in your .env file.');
    console.error('The server will still run, but search history will not be saved.');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    console.error('The server will still run, but search history will not be saved.');
  }
}

module.exports = connectDB;