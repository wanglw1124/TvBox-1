const { GIT_NAME } = require("./constant");

const { v4: uuid } = require("uuid");

const generateDownloadLink = (path) => {
  return `https://raw.githubusercontent.com/${GIT_NAME}/${path}`;
};

const generateUUid = () => {
  return uuid();
};

module.exports = {
  generateUUid,
  generateDownloadLink,
};
