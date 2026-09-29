// errorHandler.js
//
// A centralized error-handling middleware.
//
// Express treats a middleware function specially and recognizes it as
// an "error handler" ONLY because it has exactly FOUR parameters:
// (err, req, res, next). Any time code elsewhere calls next(err)
// instead of next(), Express skips straight to this function.
//
// We do not expect this to fire often in this project, because:
//   - routeController.js validates input before calling the service
//   - routeService.js never throws (it catches errors internally and
//     returns { success: false, error } instead)
//
// This exists as a SAFETY NET: if something truly unexpected happens
// (a bug, a bad file read, etc.), this stops the server from crashing
// and sends back a clean JSON error instead of leaking a stack trace
// to whoever called the API.

function errorHandler(err, req, res, next) {
  console.error('Unexpected server error:', err.message);

  res.status(500).json({
    error: 'Something went wrong on the server. Please try again later.'
  });
}

module.exports = errorHandler;