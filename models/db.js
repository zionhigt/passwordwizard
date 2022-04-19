const sqlite = require('sqlite3').verbose();


const source = "./data.sqlite";
const dbConnect = new sqlite.Database(source, (err) => {
    if(err && err.code !== 0) throw err;
})
dbConnect.query = dbConnect.all;
module.exports = dbConnect;
