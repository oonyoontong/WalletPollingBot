var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var teleSchema = new Schema({
    chatId:{type:Number, required:true,unique:true,index:true}
});

module.exports= mongoose.model('Tele', teleSchema);