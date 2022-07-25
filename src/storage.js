const LocalStorage = require("node-localstorage").LocalStorage;

const JSON5 = require("json5");

const {
  DATA_STORAGE_KEY,
  CONFING_STORAGE_KEY,
  GIT_NAME,
} = require("./constant");

const config = new LocalStorage(DATA_STORAGE_KEY + "/" + CONFING_STORAGE_KEY);

const setConfStore = (key, value) => {
  config.setItem(key, JSON5.stringify(value));
};

const getConfStore = (key) => {
  return JSON5.parse(config.getItem(key));
};

module.exports = {
  setConfStore,
  getConfStore,
};
