module.exports = (statusCode, err, next) => {
  console.log("Handling Error!");
  let error;
  if (err instanceof Error) {
    // Error is an Error object
    error = err;
  } else {
    // Error is a string
    error = new Error(err);
  }
  error.statusCode = statusCode;
  next(error);
};
