import download from 'image-downloader';

export default function downloadImage(url, path) {
    return new Promise((resolve, reject) => {
      download.image({
        url: url,
        dest: path
      })
      .then(({ filename }) => {
        resolve(filename);
      })
      .catch((err) => {
        reject(err);
      });
    });
  }