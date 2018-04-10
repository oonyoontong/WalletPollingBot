var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tokenSchema = new Schema({
    dateAdded: Date,
    balance: Number,
    name: String,
    symbol: String
},{ _id : false });

var walletSchema = new Schema({
    address: String,
    lastUpdated: Date,
    tokens: [tokenSchema],
    child: tokenSchema
});



module.exports= mongoose.model('Wallet', walletSchema);
