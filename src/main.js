const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { packAndEncryptHrav, decryptAndUnpackHrav, exportToStandardHtml } = require('./merenEngine');

let mainWindow = null;
let fileToOpenOnStartup = null;

function parseStartupArgs(argv) {
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg && !arg.startsWith('--') && arg.toLowerCase().endsWith('.hrav') && fs.existsSync(arg)) {
      return path.resolve(arg);
    }
  }
  return null;
}

fileToOpenOnStartup = parseStartupArgs(process.argv);

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      const filePath = parseStartupArgs(commandLine);
      if (filePath) {
        mainWindow.webContents.send('meren:load-file-from-path', filePath);
      }
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Meren Studio - Güvenli .hrav Düzenleyici & Görüntüleyici',
    backgroundColor: '#0f141c',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    if (fileToOpenOnStartup) {
      mainWindow.webContents.send('meren:load-file-from-path', fileToOpenOnStartup);
      fileToOpenOnStartup = null;
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Olay Yöneticileri
ipcMain.handle('meren:open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '.hrav Dosyası Aç',
    filters: [
      { name: 'Hrav Şifreli Dokümanı (*.hrav)', extensions: ['hrav'] },
      { name: 'Tüm Dosyalar (*.*)', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  try {
    const rawBuffer = fs.readFileSync(filePath);
    const docData = decryptAndUnpackHrav(rawBuffer);
    return {
      success: true,
      filePath,
      fileName: path.basename(filePath),
      fileSize: rawBuffer.length,
      data: docData
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
});

ipcMain.handle('meren:read-file-by-path', async (event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('Dosya bulunamadı: ' + filePath);
    }
    const rawBuffer = fs.readFileSync(filePath);
    const docData = decryptAndUnpackHrav(rawBuffer);
    return {
      success: true,
      filePath,
      fileName: path.basename(filePath),
      fileSize: rawBuffer.length,
      data: docData
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
});

ipcMain.handle('meren:save-file', async (event, { filePath, documentData }) => {
  try {
    let targetPath = filePath;

    if (!targetPath) {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: '.hrav Olarak Kaydet (Otomatik Şifrelenir)',
        defaultPath: (documentData.title || 'Belge') + '.hrav',
        filters: [
          { name: 'Hrav Şifreli Dokümanı (*.hrav)', extensions: ['hrav'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return { canceled: true };
      }
      targetPath = result.filePath;
      if (!targetPath.toLowerCase().endsWith('.hrav')) {
        targetPath += '.hrav';
      }
    }

    const encryptedBuffer = packAndEncryptHrav(documentData);
    fs.writeFileSync(targetPath, encryptedBuffer);

    return {
      success: true,
      filePath: targetPath,
      fileName: path.basename(targetPath),
      fileSize: encryptedBuffer.length,
      updatedAt: documentData.updatedAt || new Date().toISOString()
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
});

ipcMain.handle('meren:export-html', async (event, documentData) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Standart HTML Olarak Dışa Aktar',
      defaultPath: (documentData.title || 'Belge') + '.html',
      filters: [
        { name: 'HTML Dosyası (*.html)', extensions: ['html', 'htm'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    const htmlContent = exportToStandardHtml(documentData);
    fs.writeFileSync(result.filePath, htmlContent, 'utf-8');

    return {
      success: true,
      filePath: result.filePath
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
});

ipcMain.handle('meren:show-in-folder', async (event, filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    shell.showItemInFolder(filePath);
  }
});
