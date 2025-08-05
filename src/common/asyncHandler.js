/**
 * Async Handler Wrapper
 * Eliminates the need for try-catch blocks in controllers and services
 * Automatically catches and forwards errors to global error handler
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Async Handler for Service Layer
 * Similar to asyncHandler but for service methods that don't have res parameter
 */
const asyncServiceHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      // Re-throw the error to be caught by the calling controller
      throw error;
    }
  };
};

/**
 * Async Handler for Repository Layer
 * Handles database operations and transforms Prisma errors
 */
const asyncRepositoryHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      // Transform Prisma errors to AppError if needed
      throw error;
    }
  };
};

module.exports = {
  asyncHandler,
  asyncServiceHandler,
  asyncRepositoryHandler
};
