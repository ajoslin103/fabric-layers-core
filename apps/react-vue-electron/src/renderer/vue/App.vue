<script setup lang="ts">
  import { ElectronAPI } from '@electron-toolkit/preload'
  import { CommandOrControlWRequest } from "../../types/channels";
  import { getRequestChannel, getReplyChannel } from '../../types/custom-browser-window'
  import Versions from './components/Versions.vue'
  import GridDemo from './components/GridDemo.vue'

  const logger = console

  declare global {
    interface Window {
      electron: ElectronAPI
    }
  }

  // --------------------------------------------------
  window.electron.ipcRenderer.on('window-identity', (evt, args) => {
    const { businessKey, instanceUid } = args
    window.businessKey = businessKey; window.instanceUid = instanceUid
    logger.debug(`window-focused - { businessKey: ${businessKey}, instanceUid: ${instanceUid} }`)

    const requestChannel = getRequestChannel(CommandOrControlWRequest, window)
    const replyChannel = getReplyChannel(CommandOrControlWRequest, window)

    logger.debug(`Vue App - businessKey: ${businessKey}, instanceUid: ${instanceUid}`)
    logger.debug(`Vue App - requestChannel: ${requestChannel}`)
    logger.debug(`Vue App - replyChannel: ${replyChannel}`)

    // listen for our special shouldClose request
    window.electron.ipcRenderer.on(
      requestChannel,
      function (event, args) {
        logger.debug(`requestChannel: ${requestChannel}`, args);
        window.electron.ipcRenderer.send(replyChannel, { shouldClose: true });
      }
    );
  });

  window.electron.ipcRenderer.on('window-focused', (evt, renderer: any) => {
    console.debug(`window-focused - renderer:`, renderer)
    window.electron.ipcRenderer.send('update-menus', renderer)
  });
</script>

<template>
  <div class="flex flex-col h-screen w-screen">
    <!-- Header -->
    <header class="h-[60px] bg-gray-800 text-white flex items-center px-6">
      <h1 class="text-xl font-bold">Vue Header</h1>
    </header>

    <!-- Main content -->
    <main class="flex-1 p-6">
      <GridDemo />
      <Versions />
    </main>

    <!-- Footer -->
    <footer class="h-[60px] bg-gray-800 text-white flex items-center px-6">
      <p>Footer from Vue</p>
    </footer>
  </div>
</template>
