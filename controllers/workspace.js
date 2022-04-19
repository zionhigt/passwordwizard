const Password = require("../models/password.js");
const Workspace = require("../models/workspace.js");
const { sendFolders } = require("./folder.js");
const { sendError } = require('./error');

exports.getData = (event, arg) => {
    const post = JSON.parse(arg);
    if(post.hasOwnProperty("workspace_id")) {
        Workspace.getId(post.workspace_id)
        .then(function(workspace) {
            if(workspace.length) {
                workspace = workspace[0];
                const filter = {
                    workspace_id:  post.workspace_id
                }
                Password.getFilter(filter)
                .then(function(passwords) {
                    const data = {
                        workspace: workspace || null,
                        data: passwords
                    }
                    event.sender.send("data", JSON.stringify(data));
                })
                .catch(function(err) {
                    throw err;
                })
            } else {
                event.sender.send("data", JSON.stringify([]));
            }
            refreshTimeout(event);

        })
        .catch(err => console.log(err));
    }
}

exports.getWorkspace = (event, arg) => {
    const post = JSON.parse(arg);
    if(post.hasOwnProperty("workspace_id")) {
        const filter = {
            folder_id:  post.folder_id
        }
        Workspace.getFilter(filter)
        .then(function(data) {
            event.sender.send("dataWorkspace", JSON.stringify(data));
            refreshTimeout(event);

        })
        .catch(function(err) {
            console.error(err);
        })
    }
}

exports.createWorkspace = (event, arg) => {
    const post = JSON.parse(arg);
    const workspace = {
        name: post.name,
        user_id: post.user_id,
        folder_id: post.folder_id
    }
    Workspace.create(workspace)
    .then(function() {
        sendFolders(event);
    })
    .catch(function(err) {
        const error = {
            modelName: "Wokspace",
            action: "créer",
            detail: workspace.name + " existe déja dans son dossier parent"
        }
        if(err.message === "SQLITE_CONSTRAINT: CHECK constraint failed: name != ''") {
            error.detail = "Le nom ne peut pas être vide !"
        }
        sendError(error);
    })
}