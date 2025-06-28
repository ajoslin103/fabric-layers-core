// https://github.com/winstonjs/winston
import { Logger } from 'electron-winston/main'
const __srcFile = 'src/main/menus/reactMenus.ts'
const logger = new Logger()

import { ipcMain, MenuItemConstructorOptions } from 'electron';

export const configureMenus = (businessKey: string): MenuItemConstructorOptions[] => {
  const menuConfiguration: MenuItemConstructorOptions[] = [];

  if (businessKey.includes('vue')) {
    logger.info(`${__srcFile} [vue] configureMenus with businessKey: ${businessKey}`)
    menuConfiguration.push({
      label: 'Vue',
      submenu: [
        { label: 'Vue Option 1', click: () => console.log('Vue Option 1 clicked!') },
        { label: 'Vue Option 2', click: () => console.log('Vue Option 2 clicked!') },
      ],
    });
  }

  return menuConfiguration;
};

