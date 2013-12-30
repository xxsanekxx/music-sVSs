var nodemailer  = require('../node_modules/nodemailer');

function EM(emailSettings) {
    // Create a Direct transport object
    this.transport = nodemailer.createTransport("SMTP", {
        service: "Gmail",
        auth: {
            user: "lifefortraveling@gmail.com",
            pass: "23rwbfb4bdb"
        }
    });
    this.settings = emailSettings;
    console.log('SMTP transport configured');
}




// EM.prototype.dispatchResetPasswordLink = function(account, callback)
// {
//         EM.transport.sendMail({
//                 from         : ES.sender,
//                 to           : account.email,
//                 subject      : 'Password Reset',
//                 text         : 'something went wrong... :(',
//                 attachment   : EM.composePasswordResetEmail(account)
//         }, callback );
// };

// EM.prototype.composePasswordResetEmail = function(o)
// {
//         var link = 'http://node-login.braitsch.io/reset-password?e='+o.email+'&p='+o.pass;
//         var html = "<html><body>";
//                 html += "Hi "+o.name+",<br><br>";
//                 html += "Your username is :: <b>"+o.user+"</b><br><br>";
//                 html += "<a href='"+link+"'>Please click here to reset your password</a><br><br>";
//                 html += "Cheers,<br>";
//                 html += "<a href='http://twitter.com/braitsch'>braitsch</a><br><br>";
//                 html += "</body></html>";
//         return  [{data:html, alternative:true}];
// };

EM.prototype.dispatchActivationLink = function(account, callback)
{
    this.transport.sendMail(this.composeActivationEmail(account), function(error, response){
        if(error){
            console.log('Error occured');
            console.log(error.message);
            return callback(err, null);
        }
        console.log(response);
        console.log('Message sent successfully!');
        callback(null, response);

    });
};

EM.prototype.composeActivationEmail = function(o)
{
    var link = 'http://localhost:3000/verification?c='+o.activationCode;

    var html = "Hi user,<br><br>";
    html += "<a href='"+link+"'>Please click here to activate your account</a><br><br>";
    html += "Cheers,<br>";
    // Message object
    var message = {

        // sender info
        from: 'lifefortraveling@gmail.com',

        // Comma separated list of recipients
        to: o.toSend,

        // Subject of the message
        subject: 'Activation of your account', //

        // plaintext body
        text: 'Hello to myself!',

        // HTML body
        html: html,

        // An array of attachments
        // attachments:[

        //     // Binary Buffer attachment
        //     {
        //         fileName: 'image.png',
        //         contents: new Buffer('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/' +
        //                              '//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U' +
        //                              'g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC', 'base64'),

        //         cid: 'note@node' // should be as unique as possible
        //     },
        // ]
    };
    console.log(message);
    return  message;
};


module.exports = EM;
