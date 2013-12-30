var ContentHandler = require('./content'),
    AuthHandler = require('./auth'),
    ErrorHandler = require('./error').errorHandler;

module.exports = exports = function(app, db, emailSettings) {
    //Content handling middleware, processes which template to show
    var contentHandler = new ContentHandler(db);
    var authHandler = new AuthHandler(db);

    //Is loggedIn user
    //app.use(authHandler.isLoggedInMiddleware);
    // The main page
    app.get('/', contentHandler.displayMainPage);

    app.get('/logout', authHandler.logout);

    app.get('/verification', authHandler.verification);

    app.get('/admin', contentHandler.displayAdminPage);

    app.get('/music', contentHandler.displayMusicPage);

    app.post('/login', authHandler.login);

    app.post('/registration', authHandler.registration);
    // Error handling middleware
    app.use(ErrorHandler);
};