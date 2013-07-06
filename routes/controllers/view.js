
var _fs = require('fs');
var _path = require('path');
var _componentsBuilder = require('./components.js');

var scaffoldFromFileName = function(filename){
	var infos = filename.split('_');
	if(infos.length==0){
		return 'article';
	}
	return infos[0];
};

exports.view = function(req, res){
	var path = ''+req.params;
	path = path.replace('.html', '.txt');
	_fs.readFile(_path.join('./contents',path) , function (err, txtObj){
		var txt = ''+txtObj;
		if (err){
			res.render('dev_error', {message: 'Path['+path+']のファイルが開けませんでした。ファイルがないかpermissionがおかしいです', description:''+err});
			return;
		}
		var fileBaseName = _path.basename(path, '.txt');
		var scaffold = scaffoldFromFileName(fileBaseName);
		
		var components = _componentsBuilder.build(txt);
		res.render('scaffolds/'+scaffold , {components: components.components});
	});
};