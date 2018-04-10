var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var lodash = require('lodash');

var AsyncPolling = require("async-polling");

const mongoDB =  'mongodb://username:password@ds139919.mlab.com:39919/walletpolling-db';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console,'MongoDB connection error'));


var api = require("./public/javascripts/ethplorer-api")
var walletController = require("./controllers/walletController");
var teleController = require("./controllers/teleController");
var TeleBot = require("node-telegram-bot-api");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


const token = "587436314:AAHRtFNkDh9VKg8iEV7ZRy_Y0sOmmPb3vAc";
const bot = new TeleBot(token,{polling: true});

/**Set the address to monitor*/
const address = require("./config").address;

require("./public/javascripts/bot").start(bot, address);

////////////////////////////////////////////////////////

const intervalTime = require("./config").intervalTime;

AsyncPolling(function(end){
    //Put axios getter here here
    api.getAccountInfo(address)
        .then(function(response){
            console.log("received data from api");

            var wallet_raw = response.data;

            var wallet_clean = walletParser(wallet_raw);

            console.log("cleaning data");
            var difference = [];

            console.log("comparing new info with database");
            walletController.get_wallet(address)
                .then(function(wallet_old){

                    if (wallet_old == null){
                        console.log("Its a new wallet!");
                    } else if (wallet_old.tokens.length < wallet_clean.tokens.length){
                        console.log("Found a new token");

                        difference = compare(wallet_clean.tokens,wallet_old.tokens);

                        console.log("\n difference:");
                        console.log(difference);
                        teleController.get_all()
                            .then(function(sub_list){
                                for (var i = 0;i < sub_list.length;i++){
                                    //console.log(sub_list[i]);
                                    for (var j = 0;j < difference.length;j++){
                                        console.log("New token: " + difference[j]);
                                        var message = "*Token was added!*\n";
                                        message += "Name: " + difference[j].name + "\n";
                                        message += "Symbol: " + difference[j].symbol + "\n";
                                        message += "Last Updated at " + wallet_old.lastUpdated;
                                        bot.sendMessage(sub_list[i].chatId, message, {parse_mode: "markdown"});
                                        console.log("message broadcasted")
                                    }
                                }
                            });

                    } else if (wallet_old.tokens.length > wallet_clean.tokens.length){
                        console.log("token was removed");

                        difference = compare(wallet_old.tokens,wallet_clean.tokens);
                        teleController.get_all()
                            .then(function(sub_list){
                                for (var i = 0;i < sub_list.length;i++){
                                    console.log(sub_list[i]);
                                    for (var j = 0;j < difference.length;j++){
                                        console.log("New token: " + difference[j]);
                                        var message = "*Token was removed!*\n";
                                        console.log(difference[j]);
                                        message += "Name: " + difference[j].name + "\n";
                                        message += "Symbol: " + difference[j].symbol + "\n";
                                        message += "Last Updated at " + wallet_old.lastUpdated;
                                        bot.sendMessage(sub_list[i].chatId, message, {parse_mode: "markdown"});
                                        console.log("message broadcasted")
                                    }
                                }
                            });

                    } else if (wallet_old.tokens.length == wallet_clean.tokens.length){
                        console.log("No change");
                       /* difference = arr_diff([1,2,3],[2]);
                        console.log("Testing broadcast");
                        teleController.get_all()
                            .then(function(sub_list){
                                for (var i = 0;i < sub_list.length;i++){
                                    console.log(sub_list[i]);
                                    for (var j = 0;j < difference.length;j++){
                                        console.log("New token: " + difference[j]);
                                        var message = "Token was removed!\n";
                                        message += difference[j];
                                        bot.sendMessage(sub_list[i].chatId, message)
                                        console.log("message broadcasted")
                                    }
                                }
                            });
*/
                    }


                    walletController.update_wallet(wallet_clean)
                        .then(function(){
                            console.log("wallet was updated");
                        })
                })
        })
    end();
},intervalTime).run();


AsyncPolling(function(end){
    api.nudgeDyno
        .then(function(){
            console.log("WAKE UP DYNO!!!!");
        })
}, 600000).run();



////////////////////////////////////////////////////////
function compare(x,y){
    var longer;
    var shorter;
    var result = []

    if (x.length > y.length){
        longer = x;
        shorter = y;
    }

    for (var i = 0; i < longer.length;i++){
        var addToResult = true;
        for (var j = 0; j < shorter.length;j++){
            if (longer[i].symbol === shorter[j].symbol){
                addToResult = false;
                break;
            }
        }
        if (addToResult){
            result.push(longer[i]);
        }
    }

    return result;
}

var walletParser = function(wallet_raw){
    var wallet_clean = {
        address: wallet_raw.address
    }

    var tokens_clean = [];
    if (wallet_raw.tokens){
        for (var i = 0; i < wallet_raw.tokens.length;i++){
            var token_raw = wallet_raw.tokens[i];
            var token_clean = {
                name:token_raw.tokenInfo.name,
                symbol:token_raw.tokenInfo.symbol
            }

            tokens_clean.push(token_clean);
        }
    }
    wallet_clean['tokens'] = tokens_clean;

    return wallet_clean;
};

/*
function arr_diff (a1, a2) {

    var a = [], diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
}
*/


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
