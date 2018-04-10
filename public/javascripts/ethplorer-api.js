var axios = require("axios");

exports.getAccountInfo = function(address){
    //"0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98"
    var api = "https://api.ethplorer.io/getAddressInfo/"+ address + "?apiKey=freekey";
    return axios.get(api)

}

