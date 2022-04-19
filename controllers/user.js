const Users = require("../models/user");
const { sendError } = require("./error");
const bcrypt = require("bcrypt");

exports.connect = (event, arg) => {
    const account = JSON.parse(arg);
    Users.getFilter({name: account.name})
    .then((user) => {
        if(!user[0].password) throw 1;
        bcrypt.compare(account.password, user[0].password)
		.then(function(valide) {
            if(!valide) {
                throw 1;
            } else {
                event.sender.send("UserConnect", JSON.stringify(user));
                refreshTimeout(event);
            }
        })
    })
    .catch(err => {
        sendError({
            modelName: "Espace personnel",
            action: "se connecter",
            detail: "Ces identifiants ne sont pas reconue"
        })
    })
}
exports.subscribe = (event, arg) => {
    const account = JSON.parse(arg);
    bcrypt.hash(account.password, 10)
    .then(function(hash) {
        account.password = hash;
        return Users.create(account);
    }.bind(this))
    .then((user) => {
        event.sender.send("UserConnect", JSON.stringify(user));
    })
    .catch(err => {console.log(err)})
}

exports.isAnyUser = (event, arg) => {
    Users.getId(1)
    .then((user) => {
        if(!user.length) {
            event.sender.send("noUserFound");
        } else {
            event.sender.send("canBeLoging");
        }
    })
    .catch(err => {console.log(err)})
}