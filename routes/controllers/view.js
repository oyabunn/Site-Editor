
var _contentUtil = require('./content-utils.js');
var _fm = require('./fileManager.js');

exports.view = function(req, res){
	_fm.getContentsFile(''+req.params, function(err, filename, txt){
		if(err){
			res.render('dev_error', {message: 'Path['+filename+']のファイルが開けませんでした。ファイルがないかpermissionがおかしいです', description:''+err});
			return;
		}
		var pageObject = _contentUtil.getPageObject(txt);
		if(pageObject)res.render('scaffolds/'+pageObject.config.view , {pageObject: pageObject});
		else res.render('dev_error', {message: 'cant parse ['+path+'] file', description:''+err});
	});
};

exports.outputView = function(req, res){
	
};