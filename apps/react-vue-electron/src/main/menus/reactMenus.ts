// https://github.com/winstonjs/winston
import { Logger } from 'electron-winston/main'
const __srcFile = 'src/main/menus/reactMenus.ts'
const logger = new Logger()

import { ipcMain, MenuItemConstructorOptions } from 'electron';

export const configureMenus = (businessKey: string):  MenuItemConstructorOptions[] => {
  const menuConfiguration: MenuItemConstructorOptions[] = [];

  if (businessKey.includes('react')) {
    logger.info(`${__srcFile} [react] configureMenus with businessKey: ${businessKey}`)
    menuConfiguration.push({
      label: 'React',
      submenu: [
        { label: 'React Option 1', click: () => console.log('React Option 1 clicked!') },
        { label: 'React Option 2', click: () => console.log('React Option 2 clicked!') },
      ],
    });
  }

  return menuConfiguration;
};

