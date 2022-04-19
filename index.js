require("./models/init-db.js")()
.then(() => {
    console.log("DB initialized");
})
.catch(err => {
    console.error(new Error("DatabaseError: " + err.toString()));
    process.exit(1);
});

const { app, ipcMain, dialog} = require('electron');


const renderView = require("./app/window");
app.whenReady().then(function(){
    const timeoutDelay = 45000;
    global.refreshTimeout = function(event) {
        clearTimeout(global.timeout);
        console.log("*** NEW TIMEOUT ***");
        global.timeout = setTimeout(function() {
            event.sender.send("UserDisconnect");
            console.log("timeout refresh")
        }.bind(this), timeoutDelay);

    }.bind(this);
    ipcMain.on("doSomethings", refreshTimeout);
    renderView();
});

const workspaceCtrl = require("./controllers/workspace");
const folderCtrl = require("./controllers/folder");
const passwordCtrl = require("./controllers/password");
const userCtrl = require("./controllers/user");


ipcMain.on("connect", userCtrl.connect);
ipcMain.on("subscribe", userCtrl.subscribe);
ipcMain.on("isAnyUser", userCtrl.isAnyUser);
ipcMain.on("getData", workspaceCtrl.getData);
ipcMain.on("getWorkspace", workspaceCtrl.getWorkspace);
ipcMain.on("createWorkspace", workspaceCtrl.createWorkspace);
ipcMain.on("getFolders", folderCtrl.getFolders);
ipcMain.on("createFolder", folderCtrl.createFolder);
ipcMain.on("postData", passwordCtrl.post);

ipcMain.on("exitApp", function(event, arg) {
    // process.exit(0);
    const options = {
        type: 'question',
        buttons: ['Oui', 'Annuler'],
        defaultId: 0,
        title: 'Demande de confirmation',
        message: 'Voulez vous fermer l\'application ?',
        detail: 'Cliquez sur Oui pour poursuivre cette action.'
    }
    dialog.showMessageBox(null, options)
    .then(function(result) {
        if(result.response === 0) {
            process.exit(0);
        }
        return;
    });
});

