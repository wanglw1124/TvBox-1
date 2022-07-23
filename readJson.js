const stripJsonComments = require("strip-json-comments");

const fs = require("fs-extra");

let data = fs.readFileSync("./setting/VIP_1/0711.json");

console.log(JSON.parse(stripJsonComments(data.toString())));
