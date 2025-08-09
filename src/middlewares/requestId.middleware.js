const { randomUUID } = require('crypto');

const requestId = (req, res, next) => {
  req.id =
    req.headers['x-correlation-id'] ||
    req.headers['x-request-id'] ||
    randomUUID();

  res.setHeader('X-Request-ID', req.id);
  next();
};

module.exports = requestId;
