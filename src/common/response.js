const sendSuccess = (res, data = null, message = 'Success', meta = {}) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (res.req?.id) {
    response.requestId = res.req.id;
  }

  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return res.status(200).json(response);
};

const sendCreated = (
  res,
  data = null,
  message = 'Resource created successfully',
  meta = {}
) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (res.req?.id) {
    response.requestId = res.req.id;
  }

  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return res.status(201).json(response);
};

const sendNoContent = (res) => {
  return res.status(204).send();
};

const sendPaginated = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const response = {
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      totalPages,
      hasNext,
      hasPrev,
    },
    timestamp: new Date().toISOString(),
  };

  if (res.req?.id) {
    response.requestId = res.req.id;
  }

  return res.status(200).json(response);
};

const successResponse = (
  data = null,
  message = 'Success',
  statusCode = 200
) => {
  return {
    success: true,
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString(),
  };
};

const errorResponse = (
  message = 'Internal Server Error',
  statusCode = 500,
  errors = null
) => {
  return {
    success: false,
    message,
    errors,
    statusCode,
    timestamp: new Date().toISOString(),
  };
};

const paginatedResponse = (data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
    statusCode: 200,
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendPaginated,
  successResponse,
  errorResponse,
  paginatedResponse,
};
