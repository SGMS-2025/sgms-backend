const asyncHandler = (fn) => {
  return (req, res, next) => {
    let called = false;
    const onceNext = (err) => {
      if (!called) {
        called = true;
        next(err);
      }
    };

    Promise.resolve(fn(req, res, onceNext)).catch(onceNext);
  };
};

module.exports = asyncHandler;
