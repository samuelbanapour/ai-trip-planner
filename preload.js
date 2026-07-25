const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tripPlannerAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (partial) => ipcRenderer.invoke('settings:save', partial),

  // Trips
  getTrips: () => ipcRenderer.invoke('trips:get'),
  saveTrip: (trip) => ipcRenderer.invoke('trips:save', trip),
  deleteTrip: (id) => ipcRenderer.invoke('trips:delete', id),

  // Export
  exportTrip: (defaultName, content) => ipcRenderer.invoke('trip:export', { defaultName, content }),
});
