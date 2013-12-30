/**
 * Created by sanek on 28.12.13.
 */
function ContentHandler(database) {
    "use strict";
    //user and sessions instances for work with db and cookies
//    this.users = module.exports.users || (database.users = database.mongo.collection('users'));
}

//display Main page (index, or index_auth), but if we have in url param "code"
//then try create new user, or replace access_token in db
ContentHandler.prototype.displayMainPage = function(req, res, next) {
    "use strict";
    var params = {title: 'Song vs Song'};
    if (req.session.authorized) params.authorized = true;

    // console.dir(req.headers);
    return res.render('index', params);

};
ContentHandler.prototype.displayMusicPage = function(req, res, next) {
    "use strict";
    if (!req.session.authorized) return res.redirect('/');
    return res.render('public');
};
ContentHandler.prototype.displayAdminPage = function(req, res, next) {
    "use strict";
    console.log('admin page');
    //var vkauth;
    if (!req.session.authorized || !~req.session.roles.indexOf('admin')) return res.redirect('/');
    // if (req.session.vkauth) {
    //     vkauth = "";
    // } else {
    //     vkauth = "";
    // }
    // console.dir(req.headers);

    return res.render('admin');
};

module.exports = ContentHandler;