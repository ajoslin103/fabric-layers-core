import { ipcMain, Menu, MenuItemConstructorOptions } from 'electron';

// https://github.com/winstonjs/winston
import { Logger } from 'electron-winston/main'
const __srcFile = 'src/main/menus/menuManager.ts'
const logger = new Logger()

// assemble our menu configurators
import { configureMenus as reactMenuConfigs } from './reactMenus';
import { configureMenus as vueMenuConfigs } from './vueMenus';
const appMenuConfigs = [reactMenuConfigs, vueMenuConfigs];

// Store the current menu template
let currentMenuTemplate: MenuItemConstructorOptions[] = [];

// ------------------------------------------------
export function updateMenus(businessKey: string): void {
  logger.info(`${__srcFile} updateMenus businessKey: ${businessKey}`);
  const menu = doConfigureMenus(businessKey);
  setMenu(menu);
}

// ------------------------------------------------
export function setMenu(template: MenuItemConstructorOptions[]): void {
  currentMenuTemplate = template; // Store the template for reference
  logger.info(`${__srcFile} setMenu: ${JSON.stringify(template)}`);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ------------------------------------------------
export function resetMenu(): void {
  logger.info(`${__srcFile} resetMenu`);
  setMenu([]); // Clear or set a default menu
}

// ------------------------------------------------
export function getMenuTemplate(): MenuItemConstructorOptions[] {
  logger.info(`${__srcFile} getMenuTemplate`);
  return currentMenuTemplate;
}

// ------------------------------------------------
export const doConfigureMenus = (businessKey: string) => {
  logger.info(`${__srcFile} [main] configureMenus with businessKey: ${businessKey}`)
  const menuConfiguration: MenuItemConstructorOptions[] = [];

  menuConfiguration.push({
    label: 'Electron',
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'quit' },
    ],
  });

  menuConfiguration.push({
    label: 'File',
    submenu: [
      { label: 'New', click: () => ipcMain.emit('new-file') },
      { label: 'Open', click: () => ipcMain.emit('open-file') },
      { role: 'close', label: 'Close', click: () => ipcMain.emit('close-file') },
    ],
  });

  // apply the assembled menu configurators
  appMenuConfigs.forEach(configurator => {
    menuConfiguration.push(...configurator(businessKey));
  });

  menuConfiguration.push({
    label: 'Help',
    submenu: [{ label: 'About', click: () => console.log('About clicked!') }],
  });

  if (businessKey.includes('dev')) {
    logger.info(`${__srcFile} [main] configureMenus with businessKey: ${businessKey} includes 'dev'`)
    menuConfiguration.push({
      label: 'Debug',
      submenu: [
        { role: 'toggleDevTools' },
      ],
    });
  }

  return menuConfiguration;
};
