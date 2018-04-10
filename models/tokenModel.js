var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tokenSchema = new Schema({
    name: String,
    symbol: String
});

module.exports= mongoose.model('Token', tokenSchema);
