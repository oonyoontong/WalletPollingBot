var teleController = require("../../controllers/teleController");
var walletController = require("../../controllers/walletController")


module.exports = {
    start: function(bot,address){

        //Subscribe to the bot
        bot.onText(/\/subscribe (.+)/, function(msg, match){
            const chatId = msg.chat.id;
            const resp = match[1]; // the captured "whatever"

            var password = "PASSWORD1"
            if (resp === password){
                teleController.create_subscriber(chatId)
                    .then(function(subscriber){
                        if(subscriber == null){
                            bot.sendMessage(chatId, "you are already subscribed!");
                        } else {
                            sub_message = "Thank you! you have subscribed to watch the Bittrex account. You will only receive messages if there is an error or when there is a new token."
                            bot.sendMessage(chatId, sub_message);
                        }
                    })
            } else {
                console.log("failed subscriber")
                bot.sendMessage(chatId, "Failed password");
            }
        });


        bot.onText(/\/ping/, function(msg){
            const chatId = msg.chat.id;
            walletController.get_date(address)
                .then(function(lastUpdated){
                    var message = "Last updated: " + lastUpdated.toString();
                    bot.sendMessage(chatId,message);
                })

        });

        bot.onText(/\/server/, function(msg){
            const chatId = msg.chat.id;
            bot.sendMessage(chatId,serverStatus.toString());

        });


    }
}