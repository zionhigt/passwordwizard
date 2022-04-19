const db = require("./db");

passwordsFields = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "name TXT NOT NULL CHECK(name != '')",
    "url TXT",
    "login TXT",
    "secret TXT NOT NULL CHECK(secret != '')",
    "createdAt DATE",
    "updatedAt DATE",
    "comment TXT",
    "workspace_id INTEGER NOT NULL",
    "UNIQUE(name, workspace_id) on CONFLICT FAIL"

]
usersFields = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "name TXT NOT NULL CHECK(name != '')",
    "password TXT NOT NULL CHECK(name != '')",
]
foldersFields = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "name TXT NOT NULL CHECK(name != '')",
    "user_id INT",
    "parent_id INTEGER NOT NULL",
    "UNIQUE(name, parent_id) on CONFLICT FAIL"
]
workspacesFields = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "name TXT NOT NULL CHECK(name != '')",
    "user_id INT",
    "folder_id INTEGER NOT NULL",
    "UNIQUE(name, folder_id) on CONFLICT FAIL"
]
const queries = [
    "CREATE TABLE IF NOT EXISTS Passwords ("+ passwordsFields.join(", ") +")",
    "CREATE TABLE IF NOT EXISTS Folders ("+ foldersFields.join(", ") +")",
    "CREATE TABLE IF NOT EXISTS Workspaces ("+ workspacesFields.join(", ") +")",
    "CREATE TABLE IF NOT EXISTS Users ("+ usersFields.join(", ") +")"
];
module.exports = function() {
    queries_execute = [];
    for(let query of queries) {
        queries_execute.push(
            new Promise(function(resolve, reject) {
                db.run(query, (err) => {
                    if(err) reject(err);
                    resolve(query);
                })
            })
        );
    }
    return Promise.all(queries_execute)
}