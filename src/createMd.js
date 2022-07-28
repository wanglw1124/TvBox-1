const { getConfStore } = require("./storage");
const fs = require("fs-extra");

const { SITE_LIST, SETTING_PATH } = require("./constant");

const { generateDownloadLink } = require("./util");

const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);

function mdTemplate(title, list) {
  return `
    ## ${title}

|   名称  | 更新时间  |地址  |
|  ----  | ----  |----  |
${list
  .map((item) => {
    return `|  ${item.title} | ${dayjs(item.time)
      .tz("PRC")
      .format("YYYY-MM-DD HH:mm:ss")} |[地址](${generateDownloadLink(
      SETTING_PATH + item.title
    )}) |`;
  })
  .join("\n")}
  `;
}

const getAllSites = () => {
  let config = getConfStore(SITE_LIST) || [];

  let sites = config
    .map((site) => {
      return getConfStore(site.uid) || [];
    })
    .flat()
    .sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

  return sites;
};

const createMd = () => {
  let sites = getAllSites();

  let text = `
  # TvBox 源 

更新时间: ${dayjs().tz("PRC").format("YYYY-MM-DD HH:mm:ss")}

${mdTemplate(
  "优质源",
  sites.filter((item) => (item.site || "").indexOf("VIP") == 0)
)}

${mdTemplate("所有源", sites)}
  `;

  fs.writeFileSync("README.md", text);
};

module.exports = {
  getAllSites,
  createMd,
};
