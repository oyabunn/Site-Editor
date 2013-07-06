
var _componentsBuilder = require('./components.js');
var _fm = require('./fileManager.js');

exports.showEditView = function(req, res){
	_fm.getContentsFile(''+req.params, function(err, filename, txt){
		if(err){
			res.render('dev_error', {message: 'Path['+path+']のファイルが開けませんでした。ファイルがないかpermissionがおかしいです', description:''+err});
			return;
		}
		var scaffold = _fm.scaffoldFromFileName(filename);
		var components = _componentsBuilder.build(txt);
		res.render('editor/'+scaffold , {components: components.components});
	});
};