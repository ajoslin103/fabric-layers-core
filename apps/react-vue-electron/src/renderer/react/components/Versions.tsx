import React, { JSX, useEffect } from "react";

import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

// --------------------------------------------------
export default function Versions(): JSX.Element {

  const [versions, setVersions] = React.useState({ electron: '', chrome: '', node: '' });

  useEffect
  (() => {
    window.electron.ipcRenderer.invoke('get-versions')
      .then((versions: any) => {
        console.log('get-versions:', versions)
        setVersions(versions);
      });
  }, []);

  return (
    <>
      <ul className="versions">
        <li className="electron-version">Electron v{ versions.electron }</li>
        <li className="chrome-version">Chromium v{ versions.chrome }</li>
        <li className="node-version">Node v{ versions.node }</li>
      </ul>
    </>
  );
}
