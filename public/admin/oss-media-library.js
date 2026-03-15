(function () {
  if (!window.CMS) {
    throw new Error("Decap CMS was not loaded.");
  }

  function ensureJson(response) {
    if (!response.ok) {
      return response.text().then(function (text) {
        throw new Error(text || ("Request failed with status " + response.status));
      });
    }
    return response.json();
  }

  function uploadFile(file, options) {
    var endpoint = options && options.upload_endpoint ? options.upload_endpoint : "/api/oss/sts";
    var uploadToken = options && options.upload_token ? options.upload_token : "";

    return fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-upload-token": uploadToken,
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
      }),
    })
      .then(ensureJson)
      .then(function (payload) {
        if (!payload || !payload.upload || !payload.upload.host || !payload.upload.fields || !payload.upload.url) {
          throw new Error("Invalid upload payload from /api/oss/sts");
        }

        var formData = new FormData();
        Object.keys(payload.upload.fields).forEach(function (key) {
          formData.append(key, payload.upload.fields[key]);
        });
        formData.append("file", file);

        return fetch(payload.upload.host, {
          method: "POST",
          body: formData,
        }).then(function (res) {
          if (!res.ok) {
            throw new Error("OSS upload failed: " + res.status);
          }
          return payload.upload.url;
        });
      });
  }

  function pickFiles(allowMultiple, accept) {
    return new Promise(function (resolve, reject) {
      var input = document.createElement("input");
      input.type = "file";
      input.multiple = Boolean(allowMultiple);
      input.accept = accept || "image/*";
      input.style.position = "fixed";
      input.style.left = "-10000px";
      input.style.top = "-10000px";
      document.body.appendChild(input);

      input.addEventListener("change", function () {
        var files = Array.prototype.slice.call(input.files || []);
        document.body.removeChild(input);
        if (!files.length) {
          reject(new Error("No files selected."));
          return;
        }
        resolve(files);
      });

      input.click();
    });
  }

  var aliyunOssMediaLibrary = {
    name: "aliyun-oss",
    init: function init(_ref) {
      var options = (_ref && _ref.options) || {};
      var handleInsert = _ref && _ref.handleInsert;

      return {
        show: function show(args) {
          var allowMultiple = args && args.allowMultiple;
          var imagesOnly = args && args.imagesOnly;
          var accept = imagesOnly ? "image/*" : "*/*";

          pickFiles(allowMultiple, accept)
            .then(function (files) {
              return Promise.all(files.map(function (file) {
                return uploadFile(file, options);
              }));
            })
            .then(function (urls) {
              if (typeof handleInsert !== "function") {
                throw new Error("Decap handleInsert callback is missing.");
              }
              if (allowMultiple) {
                handleInsert(urls);
              } else {
                handleInsert(urls[0]);
              }
            })
            .catch(function (error) {
              // eslint-disable-next-line no-alert
              alert("上传失败: " + (error && error.message ? error.message : "Unknown error"));
            });
        },
        hide: function hide() {},
        enableStandalone: function enableStandalone() {},
      };
    },
  };

  window.CMS.registerMediaLibrary(aliyunOssMediaLibrary);
  window.CMS.init();
})();
