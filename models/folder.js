const mysql = require('mysql');
const DB = require('./db');

exports.create = folder =>{
	let query = 'INSERT INTO Folders (name, user_id, parent_id) VALUES (?, ?, ?)';
	query = mysql.format(query, Object.values(folder));
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res, field) => {
			console.log(error || query)
			if (error) reject(error);
			resolv(this.getFilter(folder));
		});
	});
};

exports.getAll = () =>{
	let query = 'SELECT * FROM Folders';
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res) => {
			console.log(error || query)
			if (error) reject(error);
			resolv(res);
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
	let query = 'SELECT * FROM Folders where ' + filterString.join(' AND ');
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res) => {
			console.log(error || query)
			if (error) reject(error);
			resolv(res);
		});
	});
};
exports.getId = (id) =>{
	let query = 'SELECT * FROM Folders where id=' + id;
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res) => {
			console.log(error || query)
			if (error) reject(error);
			resolv(res);
		});
	});
};