# Paint Module

## Overview

The `paint` directory implements drawing and painting capabilities for the fabric-layers-core library. This module provides functionality for free-form drawing, annotations, and other canvas-based interactions that allow users to directly create content on the map.

## Structure

```
src/paint/
├── Canvas.js     # Enhanced canvas with drawing capabilities
├── ShapeMixin.js # Shape-related functionality for Canvas
└── index.js      # Exports for public API
```

## Canvas Class

The `Canvas.js` file defines an enhanced canvas component that extends the fabric.js Canvas with additional drawing and interaction capabilities. This class serves as the foundation for the painting functionality.

```javascript
// Canvas.js simplified concept
export class Canvas extends Base {
  constructor(element, options) {
    super(options);
    
    // Initialize fabric canvas
    this.canvas = new fabric.Canvas(element, {
      selection: true,
      ...options
    });
    
    // Set initial mode
    this.mode = this.mode || 'DRAW';
    
    // Register event listeners
    this.setupEventListeners();
  }
  
  // Event handling setup
  setupEventListeners() {
    this.canvas.on('mouse:down', this.onMouseDown.bind(this));
    this.canvas.on('mouse:move', this.onMouseMove.bind(this));
    this.canvas.on('mouse:up', this.onMouseUp.bind(this));
    // Additional event listeners...
  }
  
  // Mouse event handlers
  onMouseDown(event) {
    switch (this.mode) {
      case 'DRAW':
        this.startDrawing(event);
        break;
      case 'SELECT':
        this.startSelection(event);
        break;
      case 'ARROW':
        this.startArrow(event);
        break;
      // Other modes...
    }
  }
  
  onMouseMove(event) {
    if (!this.isDrawing) return;
    
    switch (this.mode) {
      case 'DRAW':
        this.continueDrawing(event);
        break;
      case 'ARROW':
        this.updateArrow(event);
        break;
      // Other modes...
    }
  }
  
  onMouseUp() {
    switch (this.mode) {
      case 'DRAW':
        this.finishDrawing();
        break;
      case 'ARROW':
        this.finishArrow();
        break;
      // Other modes...
    }
    
    this.isDrawing = false;
  }
  
  // Drawing mode methods
  startDrawing(event) {
    this.isDrawing = true;
    // Initialize path
    this.currentPath = new fabric.Path('M 0 0', {
      stroke: this.color || 'black',
      strokeWidth: this.strokeWidth || 2,
      fill: false
    });
    this.currentPath.path = [];
    
    // Add initial point
    const point = this.getPointer(event);
    this.currentPath.path.push(['M', point.x, point.y]);
    
    this.canvas.add(this.currentPath);
  }
  
  continueDrawing(event) {
    const point = this.getPointer(event);
    this.currentPath.path.push(['L', point.x, point.y]);
    this.currentPath.setCoords();
    this.canvas.renderAll();
  }
  
  finishDrawing() {
    this.currentPath = null;
    this.canvas.renderAll();
    this.emit('path:created');
  }
  
  // Helper methods
  getPointer(event) {
    return this.canvas.getPointer(event.e);
  }
  
  // Mode switching
  setMode(mode) {
    this.mode = mode;
    
    // Configure canvas based on mode
    switch (mode) {
      case 'DRAW':
        this.canvas.isDrawingMode = false;
        this.canvas.selection = false;
        break;
      case 'SELECT':
        this.canvas.isDrawingMode = false;
        this.canvas.selection = true;
        break;
      // Other modes...
    }
    
    this.emit('mode:changed', { mode });
  }
}
```

## ShapeMixin

The `ShapeMixin.js` file provides additional shape-related functionality to the Canvas class through a mixin pattern. This includes methods for creating, editing, and managing predefined shapes like rectangles, circles, and arrows.

```javascript
// ShapeMixin.js simplified concept
export const ShapeMixin = {
  // Rectangle drawing
  startRectangle(event) {
    const point = this.getPointer(event);
    this.isDrawing = true;
    this.originPoint = point;
    
    this.currentShape = new fabric.Rect({
      left: point.x,
      top: point.y,
      width: 0,
      height: 0,
      stroke: this.color || 'black',
      strokeWidth: this.strokeWidth || 2,
      fill: this.fill || 'rgba(0,0,0,0.1)'
    });
    
    this.canvas.add(this.currentShape);
  },
  
  updateRectangle(event) {
    const point = this.getPointer(event);
    const width = point.x - this.originPoint.x;
    const height = point.y - this.originPoint.y;
    
    this.currentShape.set({
      width: Math.abs(width),
      height: Math.abs(height),
      left: width > 0 ? this.originPoint.x : point.x,
      top: height > 0 ? this.originPoint.y : point.y
    });
    
    this.currentShape.setCoords();
    this.canvas.renderAll();
  },
  
  finishRectangle() {
    this.currentShape.setCoords();
    this.canvas.renderAll();
    this.emit('rectangle:created', { shape: this.currentShape });
    this.currentShape = null;
  },
  
  // Arrow drawing
  startArrow(event) {
    const point = this.getPointer(event);
    this.isDrawing = true;
    this.originPoint = point;
    
    // Create arrow line
    this.currentShape = new fabric.Line([
      point.x, point.y, point.x, point.y
    ], {
      stroke: this.color || 'black',
      strokeWidth: this.strokeWidth || 2
    });
    
    // Add arrowhead
    this.arrowhead = new fabric.Triangle({
      width: 10,
      height: 15,
      fill: this.color || 'black',
      left: point.x,
      top: point.y
    });
    
    this.canvas.add(this.currentShape);
    this.canvas.add(this.arrowhead);
  },
  
  updateArrow(event) {
    const point = this.getPointer(event);
    
    // Update line endpoints
    this.currentShape.set({
      x2: point.x,
      y2: point.y
    });
    
    // Calculate angle for arrowhead
    const angle = Math.atan2(
      point.y - this.originPoint.y,
      point.x - this.originPoint.x
    ) * 180 / Math.PI;
    
    // Position arrowhead
    this.arrowhead.set({
      left: point.x,
      top: point.y,
      angle: angle + 90
    });
    
    this.canvas.renderAll();
  },
  
  finishArrow() {
    // Group line and arrowhead
    const group = new fabric.Group([this.currentShape, this.arrowhead], {
      selectable: true,
      hasControls: true
    });
    
    this.canvas.remove(this.currentShape);
    this.canvas.remove(this.arrowhead);
    this.canvas.add(group);
    
    this.emit('arrow:created', { shape: group });
    
    this.currentShape = null;
    this.arrowhead = null;
    this.canvas.renderAll();
  }
};
```

## Integration with Map

The Paint module is integrated with the Map component through:

- The Map component uses Canvas capabilities for drawing modes
- The Map's mode system includes paint-related modes like DRAW, ARROW, etc.
- Paint objects created in drawing modes are converted to proper fabric.js objects on the canvas

```javascript
// Example integration with Map
map.setMode('DRAW');
map.on('path:created', (e) => {
  console.log('A new path was created');
  // Additional processing of the drawn path
});
```

## Drawing Modes

The Paint module supports several drawing modes:

1. **DRAW**: Free-form drawing with paths
2. **SELECT**: Selection and manipulation of existing objects
3. **ARROW**: Creating directional arrows
4. **RECTANGLE**: Creating rectangle shapes
5. **CIRCLE**: Creating circular shapes
6. **TEXT**: Adding text annotations

Each mode has its own set of event handlers and behaviors, allowing for different types of content creation.

## Design Decisions

1. **Mode-based interaction**: Different drawing behaviors are activated through modes
2. **Mixin architecture**: Shape-specific functionality is separated into a mixin for better organization
3. **Event-driven communication**: Drawing events emit signals that can be used by other components
4. **Direct fabric.js integration**: Leverages fabric.js capabilities while adding custom functionality

## Usage Examples

```javascript
// Create canvas with paint capabilities
const paintCanvas = new FabricLayers.Canvas('canvas-element', {
  width: 800,
  height: 600,
  color: 'red',
  strokeWidth: 3
});

// Set drawing mode
paintCanvas.setMode('DRAW');

// Listen for drawing events
paintCanvas.on('path:created', (e) => {
  console.log('New path created');
});

// Change drawing properties
paintCanvas.color = 'blue';
paintCanvas.strokeWidth = 5;
```

The Paint module provides a versatile drawing system that allows users to create content directly on the map, enabling annotation, highlighting, and other visual communication functions.
