var walletModel = require("../models/walletModel");

exports.get_date = function(address){
    return new Promise(function(resolve,reject){
        walletModel.findOne({address: address},function(err,wallet){
            if (err)
                console.log(err)
            resolve(wallet.lastUpdated);
        })
    })
};

exports.create_wallet = function(wallet_info){
    return new Promise(function(resolve,reject){
        console.log("creating new wallet");
        wallet_info["lastUpdated"] = Date.now();
        var wallet = new walletModel(wallet_info);
        wallet.save(function(err,wallet){
            if (err)
                console.log(err);
            resolve(wallet);
        })

    })
}

exports.update_wallet = function(wallet_info){
    return new Promise(function(resolve,reject){
        console.log("currently updating");
        wallet_info["lastUpdated"] = Date.now();
        walletModel.update(
            {address: wallet_info.address},
            wallet_info,
            {upsert: true},
            function(err,wallet){
                if (err)
                    console.log(err)
                resolve(wallet);
            }
        )
    })
}

exports.get_wallet = function(address){
    return new Promise(function(resolve,reject){
        walletModel.findOne({address:address}, function(err,wallet){
            if (err)
                console.log(err);

            resolve(wallet);


            }
        )
    })
};

exports.set_lastUpdated = function(address){
    return new Promise(function(resolve,reject){
        walletModel.update(
            {address:address},
            {lastUpdated: Date.now()},
            {new:true},
            function(err,wallet){
                if (err)
                    console.log(err)
                resolve(wallet);
            }
        )
    })
};

exports.add_token = function(difference_array,address){
    return new Promise(function(resolve,reject){
        walletModel.update(
            {address: address},
            {$pushAll: {tokens:difference_array}},
            {new:true,upsert:true},
            function(err,wallet){
                if (err)
                    console.log(err)
                resolve(wallet);
            })
    })
}