# Map Module

## Overview

The `map` directory contains the core mapping functionality of the fabric-layers-core library. The Map component serves as the central controller that integrates all other modules, providing a canvas for visualization and managing user interactions.

## Structure

```
src/map/
├── Map.js        # Primary Map class implementation
├── ModesMixin.js # Interaction modes functionality
└── index.js      # Exports for public API
```

## Map Class

The `Map` class is the central component of the library, responsible for:

- Creating and managing the canvas element
- Handling pan and zoom operations
- Managing layers and their interactions
- Coordinating the grid system
- Processing user input events

```javascript
// Map.js simplified concept
export class Map extends mix(Base).with(ModesMixin) {
  constructor(container, options) {
    super(options);
    
    // Initialize default properties
    this.container = container;
    this.center = new Point(this.center);
    
    // Setup canvas
    this.canvas = new fabric.Canvas(/* ... */);
    
    // Register event handlers
    this.setupEventListeners();
    
    // Initialize grid if enabled
    if (this.showGrid) {
      this.addGrid();
    }
  }
  
  // Layer management methods
  addLayer(layer) {
    this.canvas.add(layer.shape);
    // Additional layer setup...
  }
  
  removeLayer(layer) {
    this.canvas.remove(layer.shape);
    // Additional cleanup...
  }
  
  // View manipulation methods
  setZoom(zoom) {
    // Implement zoom functionality
  }
  
  panTo(point) {
    // Implement panning functionality
  }
  
  // Additional methods...
}
```

## ModesMixin

The `ModesMixin` provides interaction mode functionality to the Map class. It handles different user interaction modes such as:

- GRAB: For panning the map
- SELECT: For selecting objects
- DRAW: For drawing on the map
- MEASURE: For measuring distances or areas

The mixin pattern allows these behaviors to be shared across different components while keeping the code modular and maintainable.

```javascript
// ModesMixin.js simplified concept
export const ModesMixin = {
  setMode(mode) {
    this.mode = mode;
    
    // Configure canvas based on mode
    switch (mode) {
      case 'GRAB':
        this.enablePanning();
        break;
      case 'SELECT':
        this.enableSelection();
        break;
      // Other modes...
    }
    
    // Emit event for mode change
    this.emit('modechange', { mode });
  }
  
  // Mode-specific methods
  enablePanning() {
    // Setup pan interaction
  }
  
  enableSelection() {
    // Setup selection interaction
  }
  
  // Additional methods...
};
```

## Event System

The Map component heavily utilizes the event system provided by the Base class. Key events include:

- `update`: Fired when the map view changes (pan/zoom)
- `modechange`: Fired when interaction mode changes
- Mouse events: `mouse:down`, `mouse:move`, `mouse:up`, etc.
- Layer events: When layers are added or removed

## Integration with Other Modules

The Map module acts as an integration point for other modules:

- **Grid**: The map initializes and manages the grid system
- **Layer**: Layers are added to and managed by the map
- **Measurement**: Measurement tools interact with the map's canvas
- **Paint**: Drawing tools use the map's canvas

## Design Decisions

1. **Mixin for modes**: Separates interaction logic from the core Map functionality
2. **Event-based communication**: Components listen to map events rather than requiring direct references
3. **Centralized layer management**: All layers are added through the map for consistent handling
4. **DOM-based sizing**: The map adapts to its container element's size

## Usage Considerations

When using the Map component:

- Initialize it with a container element
- Configure options like width, height, and showGrid
- Add layers using the addLayer method
- Change interaction modes as needed
- Listen to events for responding to user interactions

The Map module serves as the glue that brings together all the other components of the fabric-layers-core library into a cohesive and interactive canvas-based application.
