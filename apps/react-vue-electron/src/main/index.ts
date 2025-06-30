import { join } from 'path'
import { nanoid } from 'nanoid'
import { app, shell, BrowserWindow, ipcMain, webContents } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'

// https://lodash.com/docs
import debounce from 'lodash/debounce'

// https://github.com/winstonjs/winston
import { Logger } from 'electron-winston/main'
const __srcFile = 'src/main/index.ts'
const logger = new Logger()

// Handle winston transport errors to prevent EIO crashes
// logger.on('error', (error) => {
//   // Silently ignore EIO errors from winston console transport
//   if (error.code !== 'EIO') {
//     console.error('Logger error:', error)
//   }
// })

import { captureState, recoverState } from './windows/windowState'
import { CustomBrowserWindow, getRequestChannel, getReplyChannel } from '../types/custom-browser-window'
import { updateMenus } from './menus/menuManager'
import { CommandOrControlWRequest } from '../types/channels'

class CustomApp {

  private requestMap: Map<string, { resolve: Function, reject: Function }> = new Map();

  constructor(private app: typeof import('electron').app) {}

  public async sendRequest(window: CustomBrowserWindow, channel: string): Promise<boolean> {
    const requestChannel = getRequestChannel(CommandOrControlWRequest, window)
    const replyChannel = getReplyChannel(CommandOrControlWRequest, window)
    const { businessKey, instanceUid } = window

    logger.info(`Promise request ${requestChannel} on businessKey: ${businessKey}`);
    return new Promise((resolve, reject) => {
      this.requestMap.set(instanceUid, { resolve, reject });

      logger.info(`Waiting for response responseChannel: ${replyChannel}`);
      ipcMain.once(replyChannel, (e, { shouldClose }) => {
        try {
          logger.info(`Received response shouldClose: ${shouldClose} to request to close window ${instanceUid}`);
          resolve(shouldClose === true);
        } catch (err: any) {
          logger.error(`Error processing response to request ${instanceUid} to window ${instanceUid}: ${err.message}`);
        }
        this.requestMap.delete(instanceUid);
      });

      logger.info(`Sending requestChannel ${requestChannel}, request to window ${instanceUid}`);
      window.webContents.send(requestChannel, { instanceUid, responseChannel: replyChannel });
    });
  }
}

const customApp = new CustomApp(app);

function createWindow(businessKey: string): void {

  const instanceUid = nanoid();
  logger.info(`${__srcFile} createWindow: ${businessKey}`)

  const allegedState = recoverState(businessKey, 'createWindow');
  const { x, y, width, height } = allegedState;

  // Create the browser window.
  const mainWindow: CustomBrowserWindow = new BrowserWindow({
    x, y, // position
    width, height, // size
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, `../preload/index.js`),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  }) as CustomBrowserWindow;

  mainWindow.instanceUid = instanceUid;
  mainWindow.businessKey = businessKey;

  mainWindow.on('ready-to-show', () => {
    logger.info(`${__srcFile} ready-to-show: ${businessKey}`)
    mainWindow.webContents.send('window-identity', { businessKey, instanceUid });
    mainWindow.show()
  })

  mainWindow.on('focus', () => {
    logger.info(`${__srcFile} window 'focus' - businessKey: ${businessKey}`)
    // tell that window so it can react to going into focus
    mainWindow.webContents.send('window-focused', businessKey);
  })

  mainWindow.on('close', async (event) => {
    event.preventDefault(); // prevent the window from closing by default
    logger.info(`createNewWindow mainWindow.on("close") - preventDefault don't close until Renderer says close it`);
    const shouldClose = await customApp.sendRequest(mainWindow, CommandOrControlWRequest);
    if (shouldClose) {
      logger.info(`closing window ${instanceUid} with busniessKey: ${businessKey}`);
      mainWindow.destroy()
    }
  });

  mainWindow.on('moved', debounce(() => captureState(mainWindow, 'moved'), 100));
  mainWindow.on('resized', debounce(() => captureState(mainWindow, 'resized'), 1000));


  mainWindow.webContents.setWindowOpenHandler((details) => {
    logger.info(`${__srcFile} windowOpenHandler: ${details.url}`)
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (app.isPackaged) {
    logger.info(`${__srcFile} app.isPackaged: ${app.isPackaged}`)
    const file = join(__dirname, `../render/${businessKey}-entry.html`)
    logger.info(`${__srcFile} opening window by loadFile: ${file}`)
    mainWindow.loadFile(file)
  } else {
    const url = `${process.env['ELECTRON_RENDERER_URL']}/${businessKey}-entry.html`
    logger.info(`${__srcFile} opening window by loadURL: ${url}`)
    mainWindow.loadURL(url)
  }

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  logger.info(`${__srcFile} app.whenReady`)

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    logger.info(`${__srcFile} browser-window-created`)
    optimizer.watchWindowShortcuts(window)
  })

  // update menus
  ipcMain.on('update-menus', (event, businessKey: string) => {
    logger.info(`${__srcFile} update-menus: ${businessKey}`)
    updateMenus(businessKey);
  })

  // get versions
  ipcMain.handle('get-versions', () => {
    const versions = {
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron
    }
    logger.info(`${__srcFile} get-versions: ${JSON.stringify(versions)}`)
    return versions;
  })

  createWindow('vue'); // appName
  createWindow('react'); // appName

  app.on('activate', function () {
    logger.info(`${__srcFile} app.on activate`)
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // if (BrowserWindow.getAllWindows().length === 0) {
    //   createWindow('vue'); // appName
    //   createWindow('react'); // appName
    // }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  logger.info(`${__srcFile} app.on window-all-closed`)
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
