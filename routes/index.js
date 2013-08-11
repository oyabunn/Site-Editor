
var _path = require('path');

var _creator =	require('./controllers/creator.js');
var _manager =	require('./controllers/manager.js');
var _users	=	require('./controllers/users.js');

exports.wire = function(app)
{
	// admin
	app.post('/login',		_users.login);
	
	// view contents
	app.get ('/view/*',		injector, _creator.view);
	
	// edit contents
	app.get ('/edit/*',		injector, _creator.showEditView);
	app.post('/save/*',		injector, _creator.save);
	app.post('/publish/*',	injector, _creator.publish);
	app.post('/upload',		injector, _creator.fileReceiver);
	
	// manage contents
	app.get ('/manage/*',	injector, _manager.manage);
	app.post('/manage/*',	injector, _manager.create);
	app.get ('/manage',		injector, _manager.manageSite);
	app.post('/manage',		injector, _manager.editSite);
	app.get ('/delete/*',	injector, _manager.deleteContent);
};

var injector = function (req, res, next){
	
	_manager.isSiteEmpty(function(isEmpty){
		if(isEmpty){
			next();
		}else{
			if(_users.isAcceptedRequestAsAdmin(req)){
				next();
			}else{
				_users.showLoginForm(req, res);
			}
		}	
	})
};