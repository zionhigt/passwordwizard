const mysql = require('mysql');
const DB = require('./db');

const crypto = require('crypto');
const ENC_KEY = process.env.ENC_KEY;
const IV = process.env.IV;
// ENC_KEY and IV can be generated as crypto.randomBytes(32).toString('hex');
// console.log(crypto.randomBytes(16).toString('hex'))
// console.log(crypto.randomBytes(16).toString('hex'))

function encrypt(val) {
  let cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  let encrypted = cipher.update(val, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};

function decrypt(encrypted) {
  let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  return (decrypted + decipher.final('utf8'));
};
// const phrase = "who let the dogs out";
// encrypted_key = encrypt(phrase);
// original_phrase = decrypt(encrypted_key);
// console.log(encrypted_key, original_phrase)




exports.create = customer =>{
	let query = 'INSERT INTO Passwords (name, url, login, secret, createdAt, updatedAt, comment, workspace_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
	query = mysql.format(query, Object.entries(customer).map(function([key, item]) {
    if(typeof(item) !== "string") {
      item = item.toString();
    }
    console.log(key, item)
    if(['name', 'secret'].includes(key) && item == ''){
      return '';
    }
    return encrypt(item);
  }));
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res, field) => {
			console.log(error || query)
			if (error) reject(error);
			resolv(res);
		});
	});
};
function decryptItem(item) {
  const decryptedItem = {};
  for(let k of Object.keys(item)) {
    if(!["id"].includes(k)) {
      decryptedItem[k] = decrypt(item[k]);
    }
  }
  return decryptedItem
}
exports.getAll = () =>{
	let query = 'SELECT * FROM Passwords';
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res) => {
			console.log(error || query)
			if (error) reject(error);
      const decryptedData = res.map(function(item) {
        return decryptItem(item);
      });
      console.log(decryptedData)
			resolv(decryptedData);
		});
	});
};
exports.getFilter = (filter) =>{
  const filterString = Object.entries(filter).map(function(item) {
    let [k, v] = item;
    if(!["id"].includes(k)) {
      if(typeof(v) !== "string") {
        v = encrypt(v.toString());
      }
      v = "'" + v + "'";
    }
    
    return k + "=" + v;
})
let query = 'SELECT * FROM Passwords where ' + filterString.join(' AND ');
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res) => {
			console.log(error || query)
			if (error) reject(error);
      const decryptedData = res.map(function(item) {
        return decryptItem(item);
      });
			resolv(decryptedData);
		});
	});
};