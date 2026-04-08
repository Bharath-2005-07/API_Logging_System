/**
 * Response Utility
 * Standardized API response format
 */

exports.successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

exports.errorResponse = (res, message = 'Error', statusCode = 400, error = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(error && process.env.NODE_ENV === 'development' && { error }),
    timestamp: new Date().toISOString(),
  });
};

exports.paginatedResponse = (res, data, total, page, limit, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
    timestamp: new Date().toISOString(),
  });
};
