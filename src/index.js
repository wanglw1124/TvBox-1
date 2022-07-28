const { setConfStore, getConfStore } = require("./storage");
const fs = require("fs-extra");

const { SITE_LIST } = require("./constant");

const { generateUUid } = require("./util");

const { getSources } = require("./getSources");

const { createMd } = require("./createMd");

const init = () => {
  const config = getConfStore(SITE_LIST) || [];

  let sites = fs.readJsonSync("./config.json");

  config.forEach((site) => {
    site.uid = site.uid || generateUUid();
  });

  sites.forEach((site) => {
    let item = config.find((item) => item.name === site.name);

    if (!item) {
      config.push({
        ...site,
        uid: generateUUid(),
      });
    }
  });
  setConfStore(SITE_LIST, config);
};

const run = async () => {
  init();

  await getSources();

  createMd();
};

run();
