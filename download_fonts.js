const fs = require('fs');
const https = require('https');
const path = require('path');

const fonts = [
  { url: 'https://db.onlinewebfonts.com/t/555dfe40341db3b52f4b7bafc3bb2432.woff2', file: 'MBSindhiWeb.woff2' },
  { url: 'https://db.onlinewebfonts.com/t/555dfe40341db3b52f4b7bafc3bb2432.woff', file: 'MBSindhiWeb.woff' },
  { url: 'https://db.onlinewebfonts.com/t/555dfe40341db3b52f4b7bafc3bb2432.ttf', file: 'MBSindhiWeb.ttf' },
  { url: 'https://db.onlinewebfonts.com/t/b2570ec402764ecff4b56583fd2370a4.woff2', file: 'MBLateefi.woff2' },
  { url: 'https://db.onlinewebfonts.com/t/b2570ec402764ecff4b56583fd2370a4.woff', file: 'MBLateefi.woff' },
  { url: 'https://db.onlinewebfonts.com/t/b2570ec402764ecff4b56583fd2370a4.ttf', file: 'MBLateefi.ttf' }
];

function download(item) {
  return new Promise((resolve, reject) => {
    const dest = path.join(__dirname, 'fonts', item.file);
    const file = fs.createWriteStream(dest);
    https.get(item.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://www.onlinewebfonts.com'
      }
    }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(dest);
          console.log(`Downloaded ${item.file} (${(stats.size / 1024).toFixed(1)} KB)`);
          resolve();
        });
      } else {
        file.close();
        fs.unlinkSync(dest);
        console.error(`Failed ${item.file}: Status ${res.statusCode}`);
        resolve(); // don't reject so others continue
      }
    }).on('error', err => {
      file.close();
      console.error(`Error downloading ${item.file}:`, err.message);
      resolve();
    });
  });
}

async function run() {
  for (const item of fonts) {
    await download(item);
  }
  console.log('All downloads completed!');
}

run();
