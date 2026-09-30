const fs = require('fs');
const path = require('path');

const mbSindhiWoff2 = fs.readFileSync(path.join(__dirname, 'fonts', 'MBSindhiWeb.woff2')).toString('base64');
const mbLateefiWoff2 = fs.readFileSync(path.join(__dirname, 'fonts', 'MBLateefi.woff2')).toString('base64');

console.log('MB Sindhi Web base64 length:', mbSindhiWoff2.length);
console.log('MB Lateefi base64 length:', mbLateefiWoff2.length);

const css = `/* ================================================================
   MB SINDHI WEB & MB LATEEFI EMBEDDED FONTS (100% OFFLINE & FILE:// SAFE)
   ================================================================ */

@font-face {
  font-family: 'MB Sindhi Web';
  src: url('data:font/woff2;charset=utf-8;base64,${mbSindhiWoff2}') format('woff2'),
       url('MBSindhiWeb.woff2') format('woff2'),
       url('MBSindhiWeb.ttf') format('truetype'),
       local('MB Sindhi Web'), local('MB Sindhi');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'MB Lateefi';
  src: url('data:font/woff2;charset=utf-8;base64,${mbLateefiWoff2}') format('woff2'),
       url('MBLateefi.woff2') format('woff2'),
       url('MBLateefi.ttf') format('truetype'),
       local('MB Lateefi SK 2.0'), local('MB Lateefi'), local('Lateefi');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Lateef';
  src: url('Lateef-Regular.ttf') format('truetype'), local('Lateef');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
`;

fs.writeFileSync(path.join(__dirname, 'fonts', 'sindhi-fonts.css'), css, 'utf8');
console.log('Successfully created fonts/sindhi-fonts.css (Size: ' + (css.length / 1024).toFixed(1) + ' KB)');
