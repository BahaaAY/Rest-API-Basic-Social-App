module.exports = (statusCode, err, next) => {
  console.log("Handling Error!");
  const error = new Error(err);
  error.statusCode = statusCode;
  next(error);
};
