const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { decryptAndUnpackHrav, exportToStandardHtml } = require('./merenEngine');

let mainWindow;
let fileToOpenOnStartup = null;

// Komut satırından gelen dosya yolunu yakala (Çift tıklama ile açılışlar için)
function extractFilePathFromArgs(args) {
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg && !arg.startsWith('--') && (arg.endsWith('.hrav') || arg.endsWith('.meren'))) {
      if (fs.existsSync(arg)) {
        return path.resolve(arg);
      }
    }
  }
  return null;
}

fileToOpenOnStartup = extractFilePathFromArgs(process.argv);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1060,
    height: 840,
    minWidth: 700,
    minHeight: 500,
    title: 'Meren Viewer - Şifreli Doküman Görüntüleyici',
    backgroundColor: '#0a0d14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.maximize();

  mainWindow.webContents.on('did-finish-load', () => {
    if (fileToOpenOnStartup) {
      mainWindow.webContents.send('load-file-from-path', fileToOpenOnStartup);
      fileToOpenOnStartup = null;
    }
  });

  // Basit menü (Görüntüleme için)
  const template = [
    {
      label: 'Dosya',
      submenu: [
        {
          label: 'Aç... (Ctrl+O)',
          accelerator: 'CmdOrCtrl+O',
          click: () => handleOpenFileDialog()
        },
        { type: 'separator' },
        {
          label: 'Yazdır / PDF (Ctrl+P)',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow.webContents.print()
        },
        { type: 'separator' },
        { label: 'Çıkış', role: 'quit' }
      ]
    },
    {
      label: 'Görünüm',
      submenu: [
        { label: 'Yeniden Yükle', role: 'reload' },
        { label: 'Tam Ekran', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Büyüt', role: 'zoomIn' },
        { label: 'Küçült', role: 'zoomOut' },
        { label: 'Sıfırla', role: 'resetZoom' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// IPC: Dosya Açma Diyaloğu
async function handleOpenFileDialog() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Şifreli Doküman Aç (.hrav / .meren)',
    filters: [
      { name: 'Meren & Hrav Dosyaları (*.hrav, *.meren)', extensions: ['hrav', 'meren'] },
      { name: 'Hrav Şifreli Dokümanı (*.hrav)', extensions: ['hrav'] },
      { name: 'Meren Şifreli Dokümanı (*.meren)', extensions: ['meren'] },
      { name: 'Tüm Dosyalar (*.*)', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const filePath = result.filePaths[0];
  return await readFileContent(filePath);
}

ipcMain.handle('open-file-dialog', async () => {
  return await handleOpenFileDialog();
});

// IPC: Belirtilen Yoldaki Dosyayı Oku ve Şifresini Çöz
async function readFileContent(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const docData = decryptAndUnpackHrav(fileBuffer);
    const stats = fs.statSync(filePath);

    if (mainWindow) {
      mainWindow.setTitle(`Meren Viewer - ${path.basename(filePath)}`);
    }

    return {
      success: true,
      filePath: filePath,
      fileSize: stats.size,
      data: docData
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

ipcMain.handle('read-file-by-path', async (event, filePath) => {
  return await readFileContent(filePath);
});

// IPC: Standart HTML Export
ipcMain.handle('export-html', async (event, documentData) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Standart HTML Olarak Dışa Aktar',
    defaultPath: `${documentData.title || 'dokuman'}.html`,
    filters: [{ name: 'HTML Web Sayfası (*.html)', extensions: ['html'] }]
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  try {
    const htmlContent = exportToStandardHtml(documentData);
    fs.writeFileSync(result.filePath, htmlContent, 'utf-8');
    return { success: true, filePath: result.filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// İkinci örnek açıldığında dosyayı mevcut pencereye gönder
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      const newFilePath = extractFilePathFromArgs(commandLine);
      if (newFilePath) {
        mainWindow.webContents.send('load-file-from-path', newFilePath);
      }
    }
  });

  app.whenReady().then(createWindow);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
