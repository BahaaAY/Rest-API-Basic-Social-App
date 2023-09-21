const fs = require("fs");
const errorHandler = require("./errorHandler");

module.exports = (filePath, next) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      errorHandler(500, "Deleting image failed.", next);
    }
  });
};
