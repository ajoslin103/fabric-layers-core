// https://github.com/winstonjs/winston
import { Logger } from 'electron-winston/main'
const __srcFile = 'src/main/windows/windowState.ts'
const logger = new Logger()

// https://github.com/alex8088/electron-conf
import { Conf } from 'electron-conf/main'
const conf = new Conf()

import { CustomBrowserWindow } from "../../types/custom-browser-window";
import { CaptureStateFn, EmptyWindowState, RecoverStateFn, WindowState } from '../../types/window-state';

// ------------------------------------------------------------------
// ------------------------------------------------------------------
export const captureState: CaptureStateFn = (cbw :CustomBrowserWindow, whyFor: string): void => {
  logger.info(`${__srcFile} captureState for: ${whyFor}`);
  const { businessKey } = cbw;
  const bounds = cbw.getBounds();
  const state = {
    isMaximized: cbw.isMaximized(),
    zoomFactor: cbw.webContents.getZoomFactor(),
    zoomLevel: cbw.webContents.getZoomLevel(),
    height: bounds.height,
    width: bounds.width,
    x: bounds.x,
    y: bounds.y,
  };
  conf.set(businessKey, state);
  logger.info(`${__srcFile} captureState for: ${businessKey} as: ${JSON.stringify(state)}`);
}

// ------------------------------------------------------------------
// ------------------------------------------------------------------
export const recoverState: RecoverStateFn = (businessKey: string, whyFor: string): WindowState => {
  logger.info(`${__srcFile} recoverState for: ${whyFor}`);
  const allegedState = conf.get(businessKey) as WindowState ?? EmptyWindowState;
  logger.info(`${__srcFile} recoverState(${businessKey}) as: ${JSON.stringify(allegedState)}`);
  return allegedState;
}

