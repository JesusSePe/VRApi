const crypto = require('crypto');

module.exports = {
    // Returns a sha-256 hash from a given string.
    sha265: function(string) {
        return crypto.createHash('sha256').update(string, 'utf-8').digest('hex');
    },
    // Create a random 6 digit string from 0 to 999999.
    salt: function(){
        return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
    },
    // Create a 4 digit token
    pin: function(){
        return crypto.randomInt(0, 10000).toString().padStart(4, "0");
    }
}