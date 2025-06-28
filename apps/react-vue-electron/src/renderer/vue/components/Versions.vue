<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { ElectronAPI } from '@electron-toolkit/preload';

  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }

  const versions = ref({
    electron: '',
    chrome: '',
    node: ''
  });

  onMounted(() => {
    window.electron.ipcRenderer.invoke('get-versions')
      .then((result: any) => {
        console.log('get-versions:', result);
        versions.value = result;
      });
  });
</script>

<template>
  <ul class="versions">
    <li class="electron-version">Electron v{{ versions.electron }}</li>
    <li class="chrome-version">Chromium v{{ versions.chrome }}</li>
    <li class="node-version">Node v{{ versions.node }}</li>
  </ul>
</template>
