import { BrowserWindow } from 'electron';

export interface CustomBrowserWindow extends BrowserWindow {
  businessKey: string;
  instanceUid: string;
}

declare global {
  interface Window {
    businessKey: string;
    instanceUid: string;
  }
}

// either type of window works
export type GenericWindow = CustomBrowserWindow | Window;

// call from the renderer or the main process
export const getRequestChannel = (channel: string, window: GenericWindow) => {
  const { instanceUid } = window;
  return `${channel}-${instanceUid}`;
}

// call from the renderer or the main process
export const getReplyChannel = (channel: string, window: GenericWindow) => {
  const { instanceUid } = window;
  return `${channel}-reply-${instanceUid}`;
}

