const { app, BrowserWindow } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let splashWindow;

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 600,
    height: 450,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    center: true,
    icon: path.join(__dirname, 'app/icon-192.png')
  });

  splashWindow.loadFile('splash.html');
}

function createMainWindow() {
  // Restore window state
  const windowState = store.get('windowState', {
    width: 1280,
    height: 800,
    isMaximized: true
  });

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      geolocation: true // Required for geolocation
    }
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadFile(path.join(__dirname, 'app/index.html'));

  mainWindow.on('close', () => {
    // Save window state
    const isMaximized = mainWindow.isMaximized();
    const bounds = isMaximized ? store.get('windowState', {}) : mainWindow.getBounds();
    store.set('windowState', {
      width: bounds.width || 1280,
      height: bounds.height || 800,
      x: bounds.x,
      y: bounds.y,
      isMaximized
    });
  });

  mainWindow.once('ready-to-show', () => {
    // DEBUG: To keep splash screen open permanently, uncomment the line below:
    // return;

    if (splashWindow) {
      splashWindow.on('closed', () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      });
      splashWindow.close();
      splashWindow = null;
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  createSplash();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
