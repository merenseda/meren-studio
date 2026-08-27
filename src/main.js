const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { packAndEncryptHrav, decryptAndUnpackHrav, exportToStandardHtml, MAGIC_HRAV, MAGIC_MEREN_V1 } = require('./merenEngine');

let mainWindow = null;
let fileToOpenOnStartup = null;

function parseStartupArgs(argv) {
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg && !arg.startsWith('--') && (arg.toLowerCase().endsWith('.hrav') || arg.toLowerCase().endsWith('.meren')) && fs.existsSync(arg)) {
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
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: 'Meren Studio',
    backgroundColor: '#0c0f14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.maximize();

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
    title: 'Şifreli Doküman Aç (.meren / .hrav)',
    filters: [
      { name: 'Meren ve Hrav Dokümanları (*.meren, *.hrav)', extensions: ['meren', 'hrav'] },
      { name: 'Meren Dosyası (*.meren)', extensions: ['meren'] },
      { name: 'Hrav Dosyası (*.hrav)', extensions: ['hrav'] },
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

ipcMain.handle('meren:save-file', async (event, { filePath, documentData, formatExt }) => {
  try {
    let targetPath = filePath;
    const selectedExt = (formatExt || 'meren').toLowerCase().replace(/^\./, '');

    if (!targetPath) {
      const defaultName = (documentData.title || 'yeni meren dosyası').trim() + '.' + selectedExt;
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Dokümanı Kaydet (AES-256 Şifrelenir)',
        defaultPath: defaultName,
        filters: selectedExt === 'hrav' 
          ? [
              { name: 'Hrav Şifreli Dokümanı (*.hrav)', extensions: ['hrav'] },
              { name: 'Meren Şifreli Dokümanı (*.meren)', extensions: ['meren'] }
            ]
          : [
              { name: 'Meren Şifreli Dokümanı (*.meren)', extensions: ['meren'] },
              { name: 'Hrav Şifreli Dokümanı (*.hrav)', extensions: ['hrav'] }
            ]
      });

      if (result.canceled || !result.filePath) {
        return { canceled: true };
      }
      targetPath = result.filePath;
    }

    const isHrav = targetPath.toLowerCase().endsWith('.hrav');
    const magic = isHrav ? MAGIC_HRAV : MAGIC_MEREN_V1;

    const encryptedBuffer = packAndEncryptHrav(documentData, magic);
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
      defaultPath: (documentData.title || 'yeni meren dosyası') + '.html',
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
