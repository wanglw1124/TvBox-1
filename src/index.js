const { setConfStore, getConfStore } = require("./storage");
const fs = require("fs-extra");

const { SITE_LIST } = require("./constant");

const { generateUUid } = require("./util");

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

  console.log(config);

  setConfStore(SITE_LIST, config);
};

init();
