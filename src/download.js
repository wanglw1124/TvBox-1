const download = require("download");

const downloadFile = (url, dir, filename) => {
  return download(url, dir, { filename }).catch((err) => {
    console.error(err);
    return [];
  });
};

const batchDownload = async (urls) => {
  return Promise.all(urls.map((item) => downloadFile(...item)));
};

module.exports = {
  downloadFile,
  batchDownload,
};
