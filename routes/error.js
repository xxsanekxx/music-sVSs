/**
 * Created by sanek on 28.12.13.
 */
exports.errorHandler = function(err, req, res, next) {
    "use strict";
    console.log('Error!!!!');
    console.error(err.message);
    console.error(err.stack);
    console.log(err.status);
    // res.json(401, {user: null});
    // res.end();
    //res.send(403);
    res.send(err.status || 500, err.message);
    //res.render('error_template', {error: err.message});
};