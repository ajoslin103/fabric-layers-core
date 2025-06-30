<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as FabricLayers from 'fabric-layers-core'

// State for controls
const minZoom = ref(0.05)
const maxZoom = ref(20)
const coordinates = ref({ x: 0, y: 0 })
const zoomLevel = ref(1.00)
const pinOrigin = ref('NONE')
const pinMargin = ref(10)
const zoomOverMouse = ref(true)
let map: any = null

// Container ref
const canvasContainer = ref(null)

// Methods
const resetView = () => {
  if (map && typeof map.reset === 'function') map.reset()
}

const updateZoomLimits = () => {
  if (!map) return

  let min = parseFloat(minZoom.value.toString())
  let max = parseFloat(maxZoom.value.toString())
  
  if (isNaN(min) || min <= 0) min = 0.01
  if (isNaN(max) || max <= min) max = min + 0.01
  
  map.minZoom = min
  map.maxZoom = max
  
  // Clamp current zoom if needed
  if (map.zoom < min) map.setZoom(min)
  if (map.zoom > max) map.setZoom(max)
}

const updateZoomDisplay = () => {
  if (!map) return
  const zoom = map.zoom || 1
  zoomLevel.value = zoom
}

const updatePinOrigin = () => {
  if (!map) return
  map.setOriginPin(pinOrigin.value)
}

const updatePinMargin = () => {
  if (!map) return
  map.setPinMargin(parseInt(pinMargin.value.toString(), 10))
}

const updateZoomOverMouse = () => {
  if (!map) return
  map.setZoomOverMouse(zoomOverMouse.value)
}

// Setup map when component mounts
onMounted(() => {
  console.log('FabricLayers version:', FabricLayers.version)

  // Create the map with grid enabled
  map = new FabricLayers.Map(canvasContainer.value, {
    width: 800,
    height: 600,
    showGrid: true,
    mode: 'GRAB', // Enable pan/zoom mode by default
  })

  // Show grid if not auto-enabled
  if (!map.grid) {
    if (typeof map.addGrid === 'function') map.addGrid()
  }

  // Event handlers
  map.on('mouse:move', (e: any) => {
    if (e && e.pointer) {
      coordinates.value = {
        x: parseFloat(e.pointer.x.toFixed(1)),
        y: parseFloat(e.pointer.y.toFixed(1))
      }
    }
  })

  map.on('mouse:out', () => {
    coordinates.value = { x: 0, y: 0 }
  })

  // Update zoom display
  map.on('update', updateZoomDisplay)
  updateZoomDisplay()

  // Debug events
  map.on('mouse:down', (e: any) => {
    if (e && e.pointer) {
      console.log('mouse:down', e.pointer)
    }
  })

  map.on('mouse:up', (e: any) => {
    if (e && e.pointer) {
      console.log('mouse:up', e.pointer)
    }
  })

  map.on('mouse:dblclick', (e: any) => {
    if (e && e.pointer) {
      console.log('mouse:dblclick', e.pointer)
    }
  })

  // Set initial values
  updateZoomLimits()
  updatePinMargin()
  updateZoomOverMouse()
})
</script>

<template>
  <div>
    <h1>fabric-layers Grid Demo</h1>
    <div class="controls">
      <label style="margin-right:10px;">
        Min Zoom: <input type="number" step="0.01" v-model="minZoom" @change="updateZoomLimits" style="width:70px;">
      </label>
      <label style="margin-right:10px;">
        Max Zoom: <input type="number" step="0.01" v-model="maxZoom" @change="updateZoomLimits" style="width:70px;">
      </label>
      <button @click="resetView">Reset View</button>
      <br><br>
      <label style="margin-right:10px;">
        Pin Origin: 
        <select v-model="pinOrigin" @change="updatePinOrigin" style="width:100px;">
          <option value="NONE">None</option>
          <option value="TOP_LEFT">Top Left</option>
          <option value="TOP_RIGHT">Top Right</option>
          <option value="BOTTOM_LEFT">Bottom Left</option>
          <option value="BOTTOM_RIGHT">Bottom Right</option>
        </select>
      </label>
      <label style="margin-right:10px;">
        Pin Margin: <input type="number" step="1" v-model="pinMargin" @change="updatePinMargin" style="width:70px;">
      </label>
      <label style="margin-right:10px;">
        <input type="checkbox" v-model="zoomOverMouse" @change="updateZoomOverMouse"> Zoom Follows Mouse
      </label>
      <br><br>
      <span class="coordinates">X: {{ coordinates.x }}, Y: {{ coordinates.y }}</span>
      <span class="zoom-level">Zoom: {{ zoomLevel.toFixed(2) }}x</span>
    </div>
    <div ref="canvasContainer" class="canvas-container"></div>
  </div>
</template>

<style scoped>
.controls {
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  margin-right: 10px;
  cursor: pointer;
}

.coordinates, .zoom-level {
  margin-left: 20px;
  font-family: monospace;
}

.canvas-container {
  border: 1px solid #ccc;
  margin: 20px 0;
  width: 800px;
  height: 600px;
  background: #f8f9fa;
}
</style>
