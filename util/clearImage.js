const fs = require("fs");
const { catchErr } = require("./errorHandler");
const errorHandler = require("./errorHandler").errorHandler;

module.exports = (filePath, next) => {
  try {
    fs.unlink(filePath, (err) => {
      if (err) {
        errorHandler(500, "Deleting image failed.");
      }
    });
  } catch {
    catchErr(err, next);
  }
};
