const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { packAndEncryptMeren, decryptAndUnpackMeren, exportToStandardHtml } = require('./merenEngine');

let mainWindow = null;
let fileToOpenOnStartup = null;

// Komut satırı argümanlarını (veya Windows'ta dosya çift tıklamalarını) yakala
function parseStartupArgs(argv) {
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg && !arg.startsWith('--') && arg.toLowerCase().endsWith('.meren') && fs.existsSync(arg)) {
      return path.resolve(arg);
    }
  }
  return null;
}

fileToOpenOnStartup = parseStartupArgs(process.argv);

// Tek örnek (Single Instance Lock) kontrolü
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
    title: 'Meren Studio - Güvenli .meren Düzenleyici & Görüntüleyici',
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
    title: '.meren Dosyası Aç',
    filters: [
      { name: 'Meren Şifreli Dokümanı (*.meren)', extensions: ['meren'] },
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
    const docData = decryptAndUnpackMeren(rawBuffer);
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
    const docData = decryptAndUnpackMeren(rawBuffer);
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
        title: '.meren Olarak Kaydet (Otomatik Şifrelenir)',
        defaultPath: (documentData.title || 'Belge') + '.meren',
        filters: [
          { name: 'Meren Şifreli Dokümanı (*.meren)', extensions: ['meren'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return { canceled: true };
      }
      targetPath = result.filePath;
      if (!targetPath.toLowerCase().endsWith('.meren')) {
        targetPath += '.meren';
      }
    }

    const encryptedBuffer = packAndEncryptMeren(documentData);
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
