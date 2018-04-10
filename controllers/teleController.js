var teleModel = require("../models/teleModel");

exports.create_subscriber = function(subscriber_id){
    return new Promise(function(resolve,reject){
        var subscriber_info = {
            chatId: subscriber_id
        }

        var new_subscriber = new teleModel(subscriber_info);
        new_subscriber.save(function(err,subscriber){
            if (err)
                console.log(err);
            resolve(subscriber);
        })
    })
}


exports.get_all = function(){
    return new Promise(function(resolve,reject){
        teleModel.find({}, function(err,subscribers){
            if (err)
                console.log(err);
            resolve(subscribers);
        })
    })
}