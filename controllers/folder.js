const Folder = require("../models/folder.js");
const Workspace = require("../models/workspace.js");
const { sendError } = require("./error");


exports.sendFolders = (event) => {
    return Folder.getAll()
    .then(function(folders) {
        return Promise.all(folders.map(async function(folder) {
            try {
                folder.workspace = await Workspace.getFilter({folder_id: folder.id});
            } catch(e){
                throw e;
            }
            return folder;
        }))
    })
    .then(function(data) {
        event.sender.send("dataFolder", JSON.stringify(data));
        refreshTimeout(event);
    })
    .catch(function(err) {
        console.error(err);
    })
}
exports.getFolders = (event, arg) => {
    if(arg === "giveMe") {
        this.sendFolders(event);
    }
}

exports.createFolder = (event, arg) => {
    const post = JSON.parse(arg);
    const folder = {
        name: post.name,
        user_id: post.user_id,
        parent_id: post.parent_id
    }
    Folder.create(folder)
    .then(function(folder) {
        event.sender.send("receiveFolder", JSON.stringify(folder));
        this.sendFolders(event);
    }.bind(this))
    .catch(function(err) {
        const error = {
            modelName: "Dossier",
            action: "créer",
            detail: folder.name + " existe déja dans son dossier parent"
        }
        if(err.message === "SQLITE_CONSTRAINT: CHECK constraint failed: name != ''") {
            error.detail = "Le nom ne peut pas être vide !"
        }
        sendError(error);
    })
}