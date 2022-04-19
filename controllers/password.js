const Password = require("../models/password.js");
const { sendError } = require("./error");


exports.post = (event, arg) => {
    const post = JSON.parse(arg);
    Password.create({
        name: post.name,
        url: post.url,
        login: post.login,
        secret: post.secret,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        comment: post.comment,
        workspace_id: post.workspace_id
    })
    .then(function(password) {
        refreshTimeout(event);
        return password;
    })
    .catch(err => {
        const error = {
            modelName: "Mot de passe",
            action: "créer",
            detail: post.name + " existe déja dans ce workspace"
        }
        if(err.message === "SQLITE_CONSTRAINT: CHECK constraint failed: name != ''") {
            error.detail = "Le nom ne peut pas être vide !"
        }
        if(err.message === "SQLITE_CONSTRAINT: CHECK constraint failed: secret != ''") {
            error.detail = "Le mot de passe ne peut pas être vide !"
        }
        sendError(error);
    })
    
}