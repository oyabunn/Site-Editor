
var _path = require('path');

var _view =		require('./controllers/view.js');
var _creator =	require('./controllers/creator.js');
var _manager =	require('./controllers/manager.js');
var _users	=	require('./controllers/users.js');

exports.wire = function(app)
{
	// admin
	app.post('/login',		_users.login);
	
	app.all ('/*',			injector);
	
	// view contents
	app.get ('/view/*',		_view.view);
	
	// edit contents
	app.get ('/edit/*',		_creator.showEditView);
	app.post('/save/*',		_creator.save);
	app.post('/publish/*',	_creator.publish);
	app.post('/upload',		_creator.fileReceiver);
	
	// manage contents
	app.get ('/manage/*',	_manager.manage);
	app.post('/manage/*',	_manager.create);
	app.get ('/manage',		_manager.manageSite);
	app.post('/manage',		_manager.editSite);
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