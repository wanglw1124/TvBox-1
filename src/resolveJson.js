const stripJsonComments = require("strip-json-comments");
const JSON5 = require("json5");

const fs = require("fs-extra");

const resolveJson = (text) => {
  try {
    return JSON5.parse(stripJsonComments(text));
  } catch (error) {
    console.log(error);
    return null;
  }
};

const resolveFileJson = (path) => {
  try {
    let text = fs.readFileSync(path);

    if (text) {
      return resolveJson(text.toString().replaceAll("#", "//"));
    }
    return null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  resolveJson,
  resolveFileJson,
};
