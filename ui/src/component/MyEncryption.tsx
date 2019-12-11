var crypto = require('crypto');
var stringtest = "mon message secret";
var nombreBits = 8;
//var key = new Buffer('mykey').toString('binary');
var fs = require('fs');


function randomGeneration(numBytes) {
  try {
  var buf = new Buffer(crypto.randomBytes(numBytes));
  } catch (ex) {
  // handle error
  }
  return buf.toString('hex');
}


// iv creation & key creation
const myiv = crypto.randomBytes(16);
const key = crypto.randomBytes(32);

// encrypt une chaine de caractere en sha256
function encrypt(message) {
  var encryptvar = crypto.createCipheriv('aes-256-cbc',key, myiv);
  encryptvar.update(stringtest, 'utf8', 'base64');
  var d = encryptvar.final('base64');
  return d;
}

function decrypt(hash) {
  var decryptvar = crypto.createDecipheriv('aes-256-cbc', key, myiv);
  decryptvar.update(hash, 'base64', 'utf8');

}

var encrypted = encrypt(stringtest);
console.log(encrypted+ ' ' + stringtest);



