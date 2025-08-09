const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      return next(error);
    }

    req[property] = value;
    next();
  };
};

const validateQuery = (schema) => {
  return validate(schema, 'query');
};

const validateParams = (schema) => {
  return validate(schema, 'params');
};

const validateBody = (schema) => {
  return validate(schema, 'body');
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  validateBody,
};
