const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('merenViewerAPI', {
  openDialog: () => ipcRenderer.invoke('open-file-dialog'),
  readFileByPath: (filePath) => ipcRenderer.invoke('read-file-by-path', filePath),
  exportHtml: (documentData) => ipcRenderer.invoke('export-html', documentData),
  onLoadFileFromPath: (callback) => {
    ipcRenderer.on('load-file-from-path', (event, filePath) => callback(filePath));
  }
});
