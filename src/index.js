const { setConfStore, getConfStore } = require("./storage");
const fs = require("fs-extra");

const { requestHtml, htmlAnalysis } = require("./request");

const { SITE_LIST } = require("./constant");

const { generateUUid } = require("./util");

const { rules } = require("./rules");

const dayjs = require("dayjs");

const init = () => {
  const config = getConfStore(SITE_LIST) || [];

  let sites = fs.readJsonSync("./config.json");

  config.forEach((site) => {
    site.uid = site.uid || generateUUid();

    let data = fs.readJsonSync("./setting/" + site.name + ".json");

    setConfStore(site.uid, data);
  });

  // sites.forEach((site) => {
  //   let item = config.find((item) => item.name === site.name);

  //   if (!item) {
  //     config.push({
  //       ...site,
  //       uid: generateUUid(),
  //     });
  //   }
  // });
  // setConfStore(SITE_LIST, config);
};

// init();

const reqestSiteData = (url) => {
  return requestHtml(url, "//time-ago")
    .then((res) => {
      return htmlAnalysis(res, rules)
        .filter((item) => item.title)
        .map((item) => {
          return { ...item, path: item.path.replace("/blob", "") };
        });
    })
    .catch((err) => []);
};

const run = async () => {
  const config = getConfStore(SITE_LIST);

  for (const item of config) {
    item.data = await reqestSiteData(item.home).then((res) => {
      // console.log(res);
      return res.filter((element) => {
        return (
          /.(json|txt)$/.test(element.title) &&
          dayjs(element.time).isAfter(dayjs().subtract(15, "day")) &&
          element.title.indexOf("福利") == -1
        );
      });
    });
  }

  console.log(config);
};

run();
