# Layer Module

## Overview

The `layer` directory contains the core layer system for the fabric-layers-core library. Layers are the primary visual elements that users add to the map, representing various types of content from simple markers to complex shapes.

## Structure

```
src/layer/
├── Connector.js  # Line connections between points
├── Group.js      # Layer grouping functionality
├── Layer.d.ts    # TypeScript definitions
├── Layer.js      # Base Layer class
├── Tooltip.js    # Text tooltip implementation
├── index.js      # Exports for public API
├── marker/       # Point-based marker implementations
└── vector/       # Vector shape implementations
```

## Layer Architecture

The layer system follows a two-tier architecture as documented in detail in [understanding-layers.md](understanding-layers.md):

1. **High-Level Components** extend the `Layer` class:
   - Marker, MarkerGroup, Connector, Polyline, Tooltip
   - Provide complete functionality including map integration
   - Support addTo(), events, styling, z-index management

2. **Low-Level Components** extend fabric.js classes directly:
   - Rect, Circle, Line, etc.
   - Provide basic shape functionality
   - Used as building blocks for custom layers

## Base Layer Class

The `Layer.js` file defines the base `Layer` class that serves as the foundation for all high-level layer components. It extends the `Base` class and provides common functionality:

```javascript
// Layer.js simplified concept
export class Layer extends Base {
  constructor(options) {
    super(options);
    
    // Initialize common properties
    this.label = this.label !== undefined ? this.label : null;
    this.draggable = this.draggable || false;
    this.zIndex = this.zIndex || 1;
    this.opacity = this.opacity || 1;
    this.keepOnZoom = this.keepOnZoom || false;
    this.clickable = this.clickable || false;
    
    // Define style object used by child classes
    this.style = {
      zIndex: this.zIndex,
      class: this.class,
      parent: this,
      keepOnZoom: this.keepOnZoom,
      // Additional style properties...
    };
  }
  
  // Add layer to map
  addTo(map) {
    if (!map) {
      if (this._map) {
        this._map.removeLayer(this);
      }
      return;
    }
    this._map = map;
    this._map.addLayer(this);
  }
  
  // Set options for the layer
  setOptions(options) {
    if (!this.shape) return;
    Object.keys(options).forEach(key => {
      this.shape.set(key, options[key]);
    });
    if (this.shape.canvas) {
      this.shape.canvas.renderAll();
    }
  }
}
```

## Primary Layer Types

### Connector

The `Connector` class implements line connections between two points (typically markers). It provides functionality for styling, updating endpoints, and responding to movement of connected elements.

### Tooltip

The `Tooltip` class provides text labeling functionality with customizable appearance. Tooltips can be attached to specific positions or other layers.

### Group

The `Group` class allows multiple layers to be grouped together for collective operations and management.

## Submodules

The layer module is further divided into two main submodules:

1. **Marker** - Point-based layers (see [layer-marker-module.md](layer-marker-module.md))
2. **Vector** - Vector shape layers (see [layer-vector-module.md](layer-vector-module.md))

## Integration with Map

Layers integrate with the Map component through:
- The `addTo(map)` method for adding layers to a map
- Event listeners for map updates
- Coordinate transformation between screen and world coordinates
- Z-index management for proper stacking order

## Design Decisions

1. **Two-tier architecture**: Separates high-level components from basic shapes
2. **Event-based updates**: Layers listen to map events to update their state
3. **Common styling system**: Consistent approach to styling across layer types
4. **Parent-child relationships**: Support for nesting layers and propagating changes

## Usage

For detailed usage examples of the layer system, refer to [using-layers.md](using-layers.md), which demonstrates how to create and add various layer types to the map.
