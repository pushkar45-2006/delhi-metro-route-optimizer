// routeRoutes.js
//
// This file only DEFINES URLs and says which controller function should
// handle each one. It should never contain actual logic - that belongs
// in the controller (or deeper, in the service).
//
// express.Router() is a mini, self-contained version of an Express app.
// We build the routes here, then "plug" this whole router into the main
// app in app.js using app.use('/api', routeRoutes).

const express = require('express');
const router = express.Router();

const { getRoute } = require('../controllers/routeController');

// GET /api/route?from=Hauz%20Khas&to=Rajiv%20Chowk&mode=distance
router.get('/route', getRoute);

module.exports = router;