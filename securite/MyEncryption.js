var crypto = require('crypto');
//var rsa = require('ursa');
var stringtest = "mon message secret";
var nombreBits = 8;
var mygroup = 'modp1';
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

//key pair generation (usage : produce a secret)
function keyGeneration(group) {
  const diffie = crypto.getDiffieHellman(group);
  const keypair = diffie.generateKeys();

  console.log(diffie.getPublicKey());
  console.log(diffie.getPrivateKey());
  return diffie;
}

function createSecret(foreignKey, environment) {
  var secret = environment.computeSecret(foreignKey);
  return secret;
}


// iv creation & key creation
const myiv = crypto.randomBytes(16);
const key = crypto.randomBytes(32);

// encrypt une chaine de caractere en sha256
function encrypt(message) {
  var encryptvar = crypto.createCipheriv('aes-256-cbc',key, myiv);
  var e = new Buffer.from(message, 'base64').toString('binary');
  e = encryptvar.update(stringtest, 'utf8', 'binary');
  e += encryptvar.final('binary');
  return e;
}

function decrypt(hash) {
  var decryptvar = crypto.createDecipheriv('aes-256-cbc', key, myiv);
  var d = decryptvar.update(hash, 'binary', 'utf8');
  d += decryptvar.final('utf8');
  return d;

}

var encrypted = encrypt(stringtest);
var decrypted = decrypt(encrypted);
console.log(encrypted);
console.log(decrypted);
var bob = keyGeneration(mygroup);
var alice = keyGeneration(mygroup);
var mysecret = createSecret(bob.getPublicKey(),alice);
console.log(mysecret);




