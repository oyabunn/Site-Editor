
var _fs = require('fs');
var _path = require('path');

exports.scaffoldFromFileName = function(filename){
	var infos = filename.split('_');
	if(infos.length==0){
		return 'article';
	}
	return infos[0];
};

exports.getContentsFile = function(path, callback){
	path = path.replace('.html', '.txt');
	_fs.readFile(_path.join('./contents',path) , function (err, txtObj){
		var txt = ''+txtObj;
		if (err){
			callback(err);
			return;
		}
		callback(null, _path.basename(path), txt);
	});
};