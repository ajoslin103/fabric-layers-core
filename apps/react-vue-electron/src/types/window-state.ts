import { CustomBrowserWindow } from "./custom-browser-window";

export interface WindowState {
  isMaximized: boolean;
  zoomFactor: number;
  zoomLevel: number;
  height: number;
  width: number;
  x?: number;
  y?: number;
}

export type CaptureStateFn = (cbw :CustomBrowserWindow, why: string) => void;
export type RecoverStateFn = (businessKey: string, why: string) => WindowState;

export const EmptyWindowState: WindowState = {
  isMaximized: false,
  zoomFactor: 1,
  zoomLevel: 0,
  height: 670,
  width: 900,
  x: undefined,
  y: undefined,
};
