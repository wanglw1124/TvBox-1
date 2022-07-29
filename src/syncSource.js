const { getAllSites } = require("./createMd");
const { setConfStore, getConfStore } = require("./storage");

const fs = require("fs-extra");
var glob = require("glob");

const { resolveFileJson } = require("./resolveJson");

const {
  JAR_DIR,
  JAR_PATH,
  EXT_DIR,
  EXT_PATH,
  SYNC_FILE_LIST,
  SETTING_NEW_DIR,
} = require("./constant");

const { generateRandomString, generateDownloadLink } = require("./util");

const { batchDownload } = require("./download");

const { find, indexOf } = require("lodash");

function createFileItem(url, ext, list) {
  let obj = find(list, (item) => item.input == encodeURI(url));

  if (obj) {
    return [
      generateDownloadLink((ext == "jar" ? JAR_PATH : EXT_PATH) + obj.title),
      obj,
      true,
    ];
  }
  let title = generateRandomString() + "." + ext;
  return [
    generateDownloadLink((ext == "jar" ? JAR_PATH : EXT_PATH) + title),
    {
      title: title,
      time: new Date(),
      input: encodeURI(url),
      dir: ext == "jar" ? JAR_DIR : EXT_DIR,
      output: (ext == "jar" ? JAR_DIR : EXT_DIR) + "/" + title,
    },
  ];
}

const judeFileDownload = () => {
  // options is optional

  let files = glob.sync(`{${JAR_DIR},${EXT_DIR}}/*`, {});

  let syncFiles = getConfStore(SYNC_FILE_LIST) || [];

  syncFiles.forEach((file) => {
    if (indexOf(files, file.output) >= 0) {
      file.download = 1;
    }
  });

  setConfStore(SYNC_FILE_LIST, syncFiles);
};

const syncSource = async () => {
  // 存在的file
  judeFileDownload();
  let sites = getAllSites();

  for (const site of sites) {
    let data = resolveFileJson(site.output);

    if (data) {
      // title input output
      let syncFiles = getConfStore(SYNC_FILE_LIST) || [];

      let newFiles = [];
      // 下载jar包
      if (data.spider) {
        let [url, file, flag] = createFileItem(data.spider, "jar", syncFiles);

        if (!flag) {
          newFiles.push(file);
        } else {
          data.spider = url;
        }
      }

      if (data.sites) {
        data.sites.forEach((item) => {
          if (
            item.ext &&
            /^http/.test(item.ext) &&
            /.json$/.test(item.ext) &&
            !/tv-player/.test(item.ext)
          ) {
            let [url, file, flag] = createFileItem(item.ext, "json", syncFiles);

            if (!flag) {
              newFiles.push(file);
            } else {
              item.ext = url;
            }
          }
        });
      }

      if (newFiles.length > 0) {
        batchDownload(
          newFiles.map((item) => [item.input, item.dir, item.title])
        );
      }

      setConfStore(
        SYNC_FILE_LIST,
        (getConfStore(SYNC_FILE_LIST) || []).concat(newFiles)
      );

      fs.writeJsonSync(SETTING_NEW_DIR + "/" + site.title, data);
    } else {
      // 数据格式错误的处理
    }
  }
};

module.exports = {
  syncSource,
};
