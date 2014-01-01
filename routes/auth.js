/**
 * Created by sanek on 28.12.13.
 */
var EM = require('../modules/email-dispatcher');
var crypto = require('crypto');
var randomHash = function() {
    // Generate hash
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    //var hash = ;
    return crypto.createHash('sha1').update(current_date + random).digest('hex');
};

// global.clientSockets = {};
var criptpassword = function(str, saldo) {
    return crypto.createHash('md5').update(str + saldo).digest("hex");
};
var em = new EM();

// Поправить передачу БД, this не пашет в коолбеках. И
function AuthHandler(database, emailSettings) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if ((this instanceof AuthHandler) === false) {
        console.log('Warning: AuthHandler constructor called without "new" operator');
        return new AuthHandler(database, emailSettings);
    }
    var users = database.mongo.collection("users");

    this.isLoggedInMiddleware = function(req, res, next) {
        if (!req.session.authorized) {
            req.session.roles = ['guest'];
        }
        return next();
    };

    this.login = function(req, res, next) {

        var email = req.body.email;
        var password = req.body.password;
        var stayOnline = req.body.stayOnline;
        users.findOne({email: email.toLowerCase(), password: criptpassword(password), emailcheck: true, "$or": [{banned: {"$exists": false}}, {banned: false}] }, function(err, item) {
            if (err || item === null){

                console.log('error to login');
                return next({
                    error: true,
                    status: 401,
                    message: 'Check your email or password'
                });
            }
            req.session.authorized = true;
            req.session.user_id = item._id;
            req.session.username = item.email;
            req.session.roles.concat(item.roles);
            //Если стоит галочка "Запомнить меня" то записываем сессию и передаем ее номер
            if (!!stayOnline) {
                var hours = 24 * 60 * 60 * 1000 * 2; // 48 hours
                req.session.cookie.expires = new Date(Date.now() + hours);
                req.session.cookie.maxAge = hours;
            }
            return res.send(200);

        });
    };

    this.logout = function(req, res, next) {
        if (!req.session.authorized){
            return next({
                error: true,
                status: 401,
                message: 'You are not logged'
            });
        }

        req.session.authorized = false;
        delete req.session.username;
        delete req.session.user_id;
        delete req.session.roles;
        return res.redirect('/');
    };

    this.registration = function(req, res, next) {
        var email = req.body.email;
        var password = req.body.password;
        var confirmationPassword = req.body.confirmationPassword;
        var check = require('validator').check;
        if (!check(email, 'Bad email').len(6, 64).isEmail() ||
            !check(password, 'Bad pass').notNull() ||
            !check(password, 'Bad confirm pass').equals(confirmationPassword)){
            return next({
                error: true,
                message: 'Bad pass or email'
            });
        }

        users.findOne({email: email.toLowerCase()}, function(err, item) {
            if (item === null){
                var account = {
                    activationCode: randomHash(),
                    toSend: email.toLowerCase(),
                };
                users.insert({
                    email: email.toLowerCase(),
                    type: "init",
                    password: criptpassword(password),
                    emailcheck: false, active_code: account.activationCode, roles: ['user'],
                    date_reg: new Date()
                }, {safe: true}, function(err, result) {

                    if (err) return next({
                        error: true,
                        message: 'Cannot insert user'
                    });
                    //console.log(result);
                    //req.session.authorized = true;
                    req.session.user_id = result[0]._id;
                    req.session.username = result[0].email;
                    req.session.roles.concat(result[0].roles);

                    em.dispatchActivationLink(account, function(err, response) {
                        if (err) return next({
                            error: true,
                            message: "Don't send verification"
                        });

                        return res.send(200);
                    });
                });
            } else return next({
                error: true,
                message: 'User already exists'
            });
        });
    };

    this.verification = function(req, res, next) {
        users.findOne({active_code: req.param('c'), emailcheck: false}, function(err, user) {
            if (!user) {
                return next({
                    error: true,
                    message: 'Invalid Activation code!'
                });
            }
            user.emailcheck = true;
            users.save(user, {safe:true}, function(err, result) {
                if (!result) {
                    return next({
                        error: true,
                        message: 'Activation failed'
                    });
                }
                return res.redirect('/');
            });
        });
    };
}

module.exports = AuthHandler;