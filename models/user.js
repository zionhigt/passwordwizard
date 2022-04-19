const mysql = require('mysql');
const DB = require('./db');

exports.create = customer =>{
	let query = 'INSERT INTO Users (name, password) VALUES (?, ?)';
	query = mysql.format(query, Object.entries(customer).map(function([key, item]) {
    if(typeof(item) !== "string") {
      item = item.toString();
    }
    return item;
  }));
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res, field) => {
			console.log(error || query)
			if (error) reject(error);
			resolv(this.getFilter({name: customer.name}));
		});
	});
};

exports.getFilter = (filter) =>{
    const filterString = Object.entries(filter).map(function(item) {
        let [k, v] = item;
        if(typeof(v) === "string") {
            v = "'" + v + "'";
        }
        return k + "=" + v;
    })
	let query = 'SELECT * FROM Users where ' + filterString.join(' AND ');
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res) => {
			console.log(error || query)
			if (error) reject(error);
			resolv(res);
		});
	});
};

exports.getId = (id) =>{
	let query = 'SELECT * FROM Users where id=' + id;
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res) => {
			console.log(error || query)
			if (error) reject(error);
			resolv(res);
		});
	});
};