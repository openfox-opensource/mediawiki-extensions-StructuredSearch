const testFolder = __dirname + '/../build/static/';
var fs = require('fs');
count = 1;
fs.readdir(testFolder + 'js', (err, files) => {
	files.forEach(file => {
    if(/\.map$/.test(file)){
    	return;
    }
    let fileName = __dirname + `/../dist/${count}.js`;
    fs.createReadStream(testFolder + 'js/' + file).pipe(fs.createWriteStream( fileName ));
    count++;
  });
});
fs.readdir(testFolder + 'css', (err, files) => {
	files.forEach(file => {
    if(/\.map$/.test(file)){
      return;
    }
    if(/^main\./.test(file)){
      return;
    }
    console.log(file,'file');
    let fileName = __dirname + `/../dist/${count}.css`;
    fs.createReadStream(testFolder + 'css/'+ file).pipe(fs.createWriteStream( fileName ));
    count++;
  });
});