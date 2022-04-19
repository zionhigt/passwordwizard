const { BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

const templatePath = "../templates/index.html";


const createWindow = () => {
    const win = new BrowserWindow({
      width: 1224,
      height: 720,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
    },
    autoHideMenuBar: true
    })
    win.maximize();
    return win;
}
const renderView = function() {
    const win = createWindow();
    win.loadURL(url.format({
        pathname: path.join(__dirname, templatePath),
        protocol: 'file:',
        slashes: true
      }))
    
}

module.exports = renderView;