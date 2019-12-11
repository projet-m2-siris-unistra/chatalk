var crypto = require('crypto');
var stringtest = "mon message secret";
var nombreBits = 256;
var fs = require('fs');

//async
crypto.randomBytes(256, function(ex, buf) {
  if (ex) throw ex;
  // handle error
});


function symetricGeneration(numBytes) {
  try {
  var buf = crypto.randomBytes(numBytes);
  } catch (ex) {
  // handle error
  }
}

// encrypt une chaine de caractere en sha256
// todo : forcer le string sur le message
function encrypt(message) {
  var shasum = crypto.createHash('sha256');
  shasum.update(stringtest);
  var d = shasum.digest('hex');
  return d;
}

var encrypted = encrypt(stringtest)
console.log(encrypted+ ' ' + stringtest);
symetricGeneration(nombreBits);


