const uploadFile = (file, req) => {
  return new Promise((resolve, reject) => {
    const fullUrl = req.protocol + "://" + req.get("host");
    const imageUrl = fullUrl + "/" + file.path;
    resolve(imageUrl);
  });
};

module.exports = { uploadFile };
