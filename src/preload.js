const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('merenAPI', {
  openDialog: () => ipcRenderer.invoke('meren:open-dialog'),
  readFileByPath: (filePath) => ipcRenderer.invoke('meren:read-file-by-path', filePath),
  saveFile: (payload) => ipcRenderer.invoke('meren:save-file', payload),
  exportHtml: (docData) => ipcRenderer.invoke('meren:export-html', docData),
  showInFolder: (filePath) => ipcRenderer.invoke('meren:show-in-folder', filePath),
  onLoadFileFromPath: (callback) => {
    ipcRenderer.on('meren:load-file-from-path', (event, filePath) => callback(filePath));
  }
});
