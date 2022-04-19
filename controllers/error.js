const { dialog } = require("electron");

exports.sendError = function(error) {
    const options = {
        type: 'error',
        buttons: ['OK'],
        defaultId: 2,
        title: 'Erreur dans ' + error.modelName,
        message: `Impossible de ${error.action} dans ${error.modelName}`,
        detail: error.detail
    }
    return dialog.showMessageBox(null, options);
}