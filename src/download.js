const download = require("download");

const downloadFile = (url, dir, filename) => {
  return download("https://ghproxy.com/" + url, dir, { filename });
};

const batchDownload = async (urls) => {
  console.log(urls);
  return Promise.all(urls.map((item) => downloadFile(...item))).catch((err) => {
    console.log(err);

    return [];
  });
};

module.exports = {
  downloadFile,
  batchDownload,
};
