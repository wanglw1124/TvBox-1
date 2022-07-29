const { setConfStore, getConfStore } = require("./storage");

const { requestHtml, htmlAnalysis } = require("./request");

const { SITE_LIST, SETTING_DIR } = require("./constant");

const { generateRandomString } = require("./util");

const { rules } = require("./rules");

const dayjs = require("dayjs");

const { batchDownload } = require("./download");

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

const getSources = async () => {
  const config = getConfStore(SITE_LIST);

  for (const site of config) {
    site.data = await reqestSiteData(site.home).then((res) => {
      return res.filter((element) => {
        return (
          /.(json|txt)$/.test(element.title) &&
          dayjs(element.time).isAfter(dayjs().subtract(30, "day")) &&
          element.title.indexOf("福利") == -1
        );
      });
    });

    // 文件比较
    let siteConfig = getConfStore(site.uid) || [];

    let compareFile = site.data
      .filter((item) => {
        let obj = siteConfig.find((obj) => obj.path === item.path);

        if (obj) {
          return new Date(item.time).getTime() > new Date(obj.time).getTime();
        }

        return true;
      })
      .map((item) => {
        return {
          ...item,
          title: generateRandomString(6) + ".json",
          url: site.download + item.path,
        };
      });

    siteConfig = siteConfig.concat(
      compareFile.map((item) => {
        return {
          title: item.title,
          time: item.time,
          site: site.name,
          path: item.path,
          input: item.url,
          output: `${SETTING_DIR}/${item.title}`,
        };
      })
    );

    if (compareFile.length) {
      //文件下载
      batchDownload(
        compareFile.map((item) => [item.url, SETTING_DIR, item.title])
      );
    }

    setConfStore(site.uid, siteConfig);
  }
};

module.exports = {
  getSources,
};
