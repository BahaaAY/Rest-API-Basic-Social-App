module.exports = (statusCode, err, next) => {
  console.log("Handling Error!");
  let error;
  if (err instanceof Error) {
    error = err;
  } else {
    error = new Error(err);
  }
  error.statusCode = statusCode;
  next(error);
};
