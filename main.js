import { app, BrowserWindow } from 'electron';
import { exec } from 'child_process';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL('http://localhost:3000'); // URL donde corre tu servidor
}

app.whenReady().then(() => {
  // Inicia tu servidor Node.js
  const server = exec('node path/to/your/server/file.js', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error starting server: ${err}`);
      return;
    }
    console.log(`Server output: ${stdout}`);
    console.error(`Server error output: ${stderr}`);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on('window-all-closed', () => {
    server.kill(); // Detiene el servidor cuando se cierra la aplicación
    if (process.platform !== 'darwin') app.quit();
  });
});
