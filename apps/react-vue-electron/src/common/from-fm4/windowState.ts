// import { ipcMain, screen } from "electron";

// // https://github.com/alex8088/electron-conf
// import { Conf } from 'electron-conf/main'
// const conf = new Conf()

// // https://lodash.com/docs
// import debounce from "lodash/debounce";

// const logger = console; // import logger from "./logger-main";

// import { EnsureWindowState } from "./recordHelpers";

// import { AnyWindowType, EnsureWindowBounds, WindowBounds, WindowState } from "./windowTypes";

// const DEBUGGING = false;
// const DEBUGGING_RESIZE = false;

// // ---------------------------------
// export type ElectronMessageHandler = (...arg0: any[]) => void;

// export interface WindowStateKeeper {
//   windowId: number,
//   windowType: AnyWindowType;
//   isMaximized: boolean;
//   zoomFactor: number;
//   zoomLevel: number;
//   height: number;
//   width: number;
//   x: number;
//   y: number;
//   track: Function;
// };

// // ------------------------------------------------------------------------
// export const windowStateKeeper = async (windowType: AnyWindowType): Promise<WindowStateKeeper> => {
//   let windowState: WindowState = EnsureWindowState({ windowType });
//   DEBUGGING_RESIZE &&
//     logger.debug(windowState, `EnsureWindowState(${windowType})`);
//   let windowSettingsTag = `windowState.${windowType}`;
//   let windowPtr: Electron.BrowserWindow;

//   // ---------------------------------
//   // ---------------------------------
//   const track = async (win: Electron.BrowserWindow) => {
//     windowState.windowId = win.id;
//     windowPtr = win;

//     const { x, y, width, height } = windowState;
//     DEBUGGING &&
//       logger.debug(EnsureWindowBounds({ x, y, width, height }), `track()`);
//     windowPtr.setBounds(EnsureWindowBounds({ x, y, width, height }));

//     windowPtr.on("close", async () => await saveState());
//     windowPtr.on("moved", debounce(async () => await captureMove, 123));
//     windowPtr.on("resized", debounce(async () => await captureResize, 1234));

//     return await saveState();
//   };

//   // ---------------------------------
//   const captureMove = async () => {
//     await saveState();
//     return windowState;
//   };

//   // ---------------------------------
//   const captureResize = async () => {
//     await saveState();
//     DEBUGGING_RESIZE && logger.debug(`windowStateKeeper.captureResize`);
//     return windowState;
//   };

//   // ---------------------------------
//   const saveState = async () => {
//     DEBUGGING &&
//       logger.debug(
//         `saveState - if (windowState && windowPtr && !windowPtr.isDestroyed())`
//       );
//     if (windowState && windowPtr && !windowPtr.isDestroyed()) {
//       DEBUGGING && logger.debug(`saveState - if (!windowState.isMaximized) {`);
//       if (!windowState.isMaximized) {
//         try {
//           DEBUGGING && logger.debug(windowState, `saveState - before windowPtr.getBounds()`);
//           const bounds: WindowBounds = windowPtr.getBounds();
//           DEBUGGING && logger.debug(windowState, `saveState - before merging bounds with state`);
//           windowState = EnsureWindowState({ ...windowState, ...bounds });
//         } catch (err) {
//           console.warn(`saveState - threw during windowPtr.getBounds(): ${err}`);
//         }
//       }
//       try {
//         windowState = {
//           ...windowState,
//           zoomFactor: +(windowPtr.webContents?.zoomFactor || 1).toFixed(2),
//           zoomLevel: +(windowPtr.webContents?.zoomLevel || 1).toFixed(2),
//           isMaximized: windowPtr.isMaximized(),
//         };
//         DEBUGGING && logger.debug(`setState - windowSettings:`, windowState);
//         conf.set(windowSettingsTag, windowState);
//         DEBUGGING && logger.debug(windowState, `saveState - after set()`);
//       } catch (err) {
//         console.warn(`threw saving settings: ${err}`);
//       }
//     }
//     return windowState;
//   };

//   // ---------------------------------
//   const getState = async () => {
//     const windowSettings = conf.get(windowSettingsTag);
//     if (windowSettings) {
//       DEBUGGING && logger.debug(`getState - windowSettings:`, windowSettings);
//       windowState = EnsureWindowState({ ...windowState, ...windowSettings });
//       DEBUGGING && logger.debug(windowState, `getState: ${windowSettingsTag}`);
//       return windowState;
//     }
//     windowState = EnsureWindowState({ windowType });
//     DEBUGGING && logger.debug(windowState, `getState: ${windowSettingsTag}`);
//     return windowState;
//   };

//   // ---------------------------------
//   // ---------------------------------
//   // return a windowStateKeeper w/up2date state
//   await getState();
//   return {
//     ...windowState,
//     track,
//   };
// };
