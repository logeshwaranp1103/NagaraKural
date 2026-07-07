const { contextBridge, ipcRenderer } = require('electron');

// Expose minimal APIs to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // You can add more APIs here if needed
});
