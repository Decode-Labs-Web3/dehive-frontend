import { app, BrowserWindow, shell, ipcMain } from "electron";
import * as path from "path";
import { spawn } from "child_process";

let mainWindow: BrowserWindow | null = null;
let nextServer: any = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../public/images/logos/tokens/dehive-logo.png"),
  });

  // Load the Next.js app
  const isDev = process.env.NODE_ENV === "development";
  console.log("NODE_ENV:", process.env.NODE_ENV, "isDev:", isDev);

  if (isDev) {
    mainWindow.loadURL("http://localhost:9000");
    mainWindow.webContents.openDevTools();
  } else {
    // Start Next.js server in production
    startNextServer();
    mainWindow.loadURL("http://localhost:3000");
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (nextServer) {
      nextServer.kill();
      nextServer = null;
    }
  });
}

function startNextServer(): void {
  const nextBin = path.join(__dirname, "../node_modules/.bin/next");
  const cwd = path.join(__dirname, "..");

  nextServer = spawn(nextBin, ["start", "-p", "3000"], {
    cwd,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });

  nextServer.on("error", (error: any) => {
    console.error("Failed to start Next.js server:", error);
  });

  nextServer.on("close", (code: any) => {
    console.log(`Next.js server exited with code ${code}`);
  });
}

ipcMain.handle("open-external", async (event, url) => {
  shell.openExternal(url);
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
