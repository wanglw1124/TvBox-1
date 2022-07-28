const { GIT_NAME } = require("./constant");

const { v4: uuid } = require("uuid");

const cryptoRandomString = require("crypto-random-string");

const generateDownloadLink = (path) => {
  return `https://ghproxy.com/https://raw.githubusercontent.com/${GIT_NAME}/main/${path}`;
};

const generateUUid = () => {
  return uuid();
};

const generateRandomString = (length = 8) => {
  return cryptoRandomString({
    length: length,
    characters: "ABCDEFGH",
  });
};

module.exports = {
  generateUUid,
  generateDownloadLink,
  generateRandomString,
};
