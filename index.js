const fs = require("fs-extra");
const path = require("path");
const download = require("download");
const dayjs = require("dayjs");
const puppeteer = require("puppeteer");

const { Request, Compile } = require("@package-tool/html-parsing");

const oneday = 1000 * 60 * 60 * 24;

const request = new Request();

let browser = null;

const rules = [
  {
    fun: "domParse",
  },
  {
    fun: "xpath",
    arg: `//*[@id="repo-content-pjax-container"]//div[@class='js-details-container Details']//div[@role='row']`,
  },
  {
    fun: "iterableFun",
    arg: {
      $$$$: [
        {
          fun: "toString",
        },
        {
          fun: "domParse",
        },
      ],
      title: [
        { fun: "xpath", arg: "//div[@role='rowheader']//a/text()" },
        {
          fun: "toString",
        },
      ],
      path: [
        { fun: "xpathSingle", arg: "//div[@role='rowheader']//a/@href" },
        {
          fun: "jsonPath",
          arg: "$.value",
        },
      ],
      time: [
        { fun: "xpathSingle", arg: "//*[@datetime]/@datetime" },
        {
          fun: "jsonPath",
          arg: "$.value",
        },
      ],
    },
  },
];

const readData = async (url) => {
  try {
    if (!browser) {
      browser = await puppeteer.launch();
    }

    const page = await browser.newPage();
    await page.goto(url);

    await page.waitForXPath("//time-ago");

    let html = await page.content();

    let data = Compile(html, rules);

    return data
      .filter((item) => item.title)
      .map((item) => {
        return { ...item, path: item.path.replace("/blob", "") };
      });
  } catch (error) {
    console.log(error);

    return [];
  }
};

const writeFile = async (urls, dir) => {
  Promise.all(urls.map((item) => download(...item)));
};

const resolver = (file) => {
  return path.resolve(__dirname, file);
};

const readConfig = () => {
  return fs.readJsonSync(resolver("./config.json"));
};

const run = async () => {
  const config = readConfig();

  for (const item of config) {
    item.data = await readData(item.home).then((res) => {
      return res.filter((element) => {
        return (
          /.(json|txt)$/.test(element.title) &&
          Date.now() - new Date(element.time).getTime() < oneday * 30 &&
          element.title.indexOf("福利") == -1
        );
      });
    });
  }

  browser && browser.close();

  let sites = [];

  for (const site of config) {
    const siteJsonPath = `./setting/${site.name}.json`;
    let dir = resolver("./setting/" + site.name);

    let siteConfig;

    if (fs.existsSync(siteJsonPath)) {
      siteConfig = fs.readJsonSync(siteJsonPath);
    } else {
      siteConfig = [];
    }

    fs.ensureDirSync(dir);

    let compareFile = site.data.filter((item) => {
      let obj = siteConfig.find((obj) => obj.path === item.path);

      if (obj) {
        return new Date(item.time).getTime() > new Date(obj.time).getTime();
      }

      return true;
    });

    if (compareFile.length > 0) {
      let urls = compareFile.map((item) => [
        site.download + item.path,
        dir + "/",
        { filename: item.title },
      ]);

      urls.forEach((element) => {
        if (fs.existsSync(element[1] + "/" + element[2].filename)) {
          fs.removeSync(element[1] + "/" + element[2].filename);
        }
      });

      await writeFile(urls);
    }

    let siteJson = compareFile.map((item) => {
      return {
        title: item.title,
        path: item.path,
        time: item.time,
        filePath: site.name + "/" + encodeURIComponent(item.title),
      };
    });

    let arr = [...siteConfig, ...siteJson].sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

    fs.writeJsonSync(siteJsonPath, arr);

    sites.push({
      name: site.name,
      files: arr.map((item) => {
        return { ...item, site: site.name };
      }),
    });
  }

  let list = sites
    .map((site) => site.files)
    .flat()
    .sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

  let text = `
  # Box 

更新时间: ${dayjs().format("YYYY-MM-DD HH:mm:ss")}

## 优质线路

|   名称  | 更新时间  |地址  |
|  ----  | ----  |----  |
${list
  .filter((item) => item.site.indexOf("VIP") == 0)
  .map((item) => {
    return `| 【${item.site}】 ${item.title} | ${dayjs(item.time).format(
      "YYYY-MM-DD HH:mm:ss"
    )} |[地址1](https://raw.fastgit.org/tv-player/box-source/main/setting/${
      item.filePath
    }) [地址2](https://ghproxy.com/https://raw.githubusercontent.com/tv-player/box-source/main/setting/${
      item.filePath
    }) |`;
  })
  .join("\n")}

## 所有线路

|   名称  | 更新时间  |地址  |
|  ----  | ----  |----  |
${list
  .map((item) => {
    return `| 【${item.site}】 ${item.title} | ${dayjs(item.time).format(
      "YYYY-MM-DD HH:mm:ss"
    )} |[地址1](https://raw.fastgit.org/tv-player/box-source/main/setting/${
      item.filePath
    }) [地址2](https://ghproxy.com/https://raw.githubusercontent.com/tv-player/box-source/main/setting/${
      item.filePath
    }) |`;
  })
  .join("\n")} 
  `;

  fs.writeFileSync("README.md", text);
};

run();
