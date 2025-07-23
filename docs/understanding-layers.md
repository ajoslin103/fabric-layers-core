# Understanding the Layer Architecture in fabric-layers

## Layer Hierarchy

The fabric-layers library implements a two-tier architecture for rendering elements:

1. **High-Level Components (extend Layer):**
   - `Marker`: Extends Layer - provides complete layer functionality
   - `MarkerGroup`: Extends Layer - provides complete layer functionality 
   - `Connector`: Extends Layer - provides complete layer functionality
   - `Polyline`: Extends Layer - provides complete layer functionality

2. **Low-Level Shape Components (extend fabric.js classes):**
   - `Rect`: Extends fabric.Rect directly - provides basic shape functionality
   - `Circle`: Extends fabric.Circle directly - provides basic shape functionality
   - `Line`: Extends fabric.Line directly - provides basic shape functionality

## The Architectural Pattern

This is an intentional design pattern:

1. **Layer Class**: The `Layer` class is a high-level abstraction that:
   - Provides consistent layer management (addTo, removeFrom, etc.)
   - Handles interaction properties (draggable, clickable)
   - Manages z-index and styling
   - Works with the Map component through addLayer/removeLayer

2. **Shape Classes**: The basic shape classes (Rect, Circle, Line) are:
   - Low-level building blocks
   - Direct extensions of fabric.js primitives
   - Used internally by higher-level components

## How This Impacts Usage

When adding elements to your map, you should typically:

1. Use high-level components (Marker, MarkerGroup, etc.) that extend Layer when you want a complete interactive element
2. Use the shape primitives when you're building custom layer types or need basic shapes

The `Layer`-extending classes work with the map's `addLayer()` method and provide the `.addTo()` convenience method, while the basic shapes would typically need to be wrapped in a custom Layer implementation.

## Creating Custom Layers

To create a custom layer that uses one of the basic shape primitives, you can extend the Layer class:

```javascript
import { Layer } from 'fabric-layers-core';
import { fabric } from 'fabric';

export class CustomCircleLayer extends Layer {
  constructor(position, radius, options = {}) {
    // Setup layer options
    options.position = position;
    options.zIndex = options.zIndex || 50;
    options.class = 'custom-circle';
    
    // Call Layer constructor
    super(options);
    
    // Store specific properties
    this.radius = radius || 20;
    this.fillColor = options.fillColor || 'blue';
    this.strokeColor = options.strokeColor || 'black';
    
    // Create the circle shape
    this.shape = new fabric.Circle({
      left: this.position.x,
      top: this.position.y,
      radius: this.radius,
      fill: this.fillColor,
      stroke: this.strokeColor,
      strokeWidth: 2,
      // Include all the Layer style properties
      ...this.style
    });
    
    // Additional initialization
    this.setupListeners();
  }
  
  setupListeners() {
    // Add event handlers
    this.shape.on('moving', () => {
      // Update position when moved
      const matrix = this.shape.calcTransformMatrix();
      const [, , , , x, y] = matrix;
      this.position = { x, y };
      this.emit('moving');
    });
  }
  
  // Add custom methods
  setRadius(radius) {
    this.radius = radius;
    this.shape.set('radius', radius);
    if (this.shape.canvas) {
      this.shape.canvas.renderAll();
    }
  }
}
```

This architectural approach allows the library to have both high-level, ready-to-use components (Markers, Connectors) and low-level building blocks (Rect, Circle) for creating custom components.
