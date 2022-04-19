const mysql = require('mysql');
const DB = require('./db');

exports.create = customer =>{
	let query = 'INSERT INTO Workspaces (name, user_id, folder_id) VALUES (?, ?, ?)';
	query = mysql.format(query, Object.values(customer));
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res, field) => {
			console.log(error || query)
			if (error) reject(error);
			resolv(res);
		});
	});
};

exports.getAll = () =>{
	let query = 'SELECT * FROM Workspaces';
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
	let query = 'SELECT * FROM Workspaces where ' + filterString.join(' AND ');
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res) => {
			console.log(error || query)
			if (error) reject(error);
			resolv(res);
		});
	});
};
exports.getId = (id) =>{
	let query = 'SELECT * FROM Workspaces where id=' + id;
	return new Promise((resolv, reject) => {
		DB.query(query, (error, res) => {
			console.log(error || query)
			if (error) reject(error);
			resolv(res);
		});
	});
};