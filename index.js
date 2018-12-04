const fetch = require('node-fetch');

const getLatestVersion = () =>
  fetch('https://www.ubnt.com/download/?platform=unifi', {
    headers: {
      'x-requested-with': 'XMLHttpRequest',
    },
  })
    .then(res => {
      if (!res.ok) {
        return res.text().then(t => {
          throw new Error('Response failed. Error: \n' + t);
        });
      }

      return res.json();
    })
    .then(json => {
      const downloads = json.downloads;
      let max = null;
      downloads.forEach(dl => {
        if (dl.name.toLowerCase().indexOf('controller') === -1) return;

        if (dl.version) {
          if (dl.version.substring(0, 1) === 'v') {
            dl.version = dl.version.substring(1);
          }

          let version = dl.version.split('.').map(v => parseInt(v, 10));
          if (max) {
            if (
              version[0] > max[0] ||
              (version[0] == max[0] && version[1] > max[1]) ||
              (version[0] == max[0] &&
                version[1] == max[1] &&
                version[2] > max[2])
            ) {
              max = version;
            }
          } else {
            max = version;
          }
        }
      });

      return max.join('.');
    });

const api = (req, res) => {
  return getLatestVersion().then(
    version => {
      res.end(version);
    },
    error => {
      res.end(500, String(error));
    },
  );
};

api.getLatestVersion = getLatestVersion;

module.exports = api;
