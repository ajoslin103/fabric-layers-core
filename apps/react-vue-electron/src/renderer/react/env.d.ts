/// <reference types="vite/client" />

// Required to allow importing images in typescript
declare module "*.png";
declare module "*.jpg";
declare module "*.svg";

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
