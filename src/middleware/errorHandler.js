// Express's built-in error handler replies with an HTML page; API clients expect JSON
const errorHandler = (err, req, res, next) => {
  // express.json() marks malformed bodies with a 4xx status
  const statusCode = err.statusCode || err.status || 500;
  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  });
};

export default errorHandler;
