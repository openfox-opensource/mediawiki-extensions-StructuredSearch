const testFolder = __dirname + '/../build/static/';
var fs = require('fs');
count = 1;
fs.readdir(testFolder + 'js', (err, files) => {
	files.forEach(file => {
    if(/\.map$/.test(file)){
      return;
    	//copy map files with the count
      
      
    }
    let fileName = __dirname + `/../dist/${count}.js`;
    let oldFileName = testFolder + 'js/' + file;
    let mapFileName = oldFileName + '.map';
    let newMapFileName = __dirname + `/../dist/${count}.js.map`;
    console.log(file,'file',oldFileName,'oldFileName',mapFileName,'mapFileName',newMapFileName,'newMapFileName');
    if(fs.existsSync(mapFileName)){
      fs.createReadStream(mapFileName).pipe(fs.createWriteStream( newMapFileName ));
    }
    //replace //# sourceMappingURL=
    let data = fs.readFileSync(testFolder + 'js/' + file, 'utf8');
    data = data.replace(/\/\/# sourceMappingURL=.+/g, `//# sourceMappingURL=${count}.js.map`);
    fs.writeFileSync(fileName, data);
    //fs.createReadStream(testFolder + 'js/' + file).pipe(fs.createWriteStream( fileName ));
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