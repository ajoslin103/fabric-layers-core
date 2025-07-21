# Layer Vector Module

## Overview

The `layer/vector` directory contains implementations for vector-based shapes in the fabric-layers-core library. Unlike markers that represent points, vector layers represent lines, polygons, and other geometric shapes on the map.

## Structure

```
src/layer/vector/
├── Circle.js   # Circle shape implementation
├── Line.js     # Line shape implementation
├── Polyline.js # Multi-segment line implementation
├── Rect.js     # Rectangle shape implementation
├── index.js    # Exports for public API
```

## Architecture

As explained in [understanding-layers.md](understanding-layers.md), the vector module demonstrates the two-tier architecture of the layer system:

1. **High-Level Components** (extend Layer):
   - `Polyline` - extends Layer class with multi-segment line functionality

2. **Low-Level Shape Components** (extend fabric.js classes directly):
   - `Circle` - extends fabric.Circle
   - `Line` - extends fabric.Line
   - `Rect` - extends fabric.Rect

This distinction is important for understanding how these components are used in the library.

## Polyline Class

The `Polyline` class is a high-level component that implements multi-segment lines. It extends the base `Layer` class and uses multiple `Line` instances to create complex paths.

```javascript
// Polyline.js simplified concept
export class Polyline extends Layer {
  constructor(_points, options) {
    options = options || {};
    options.points = _points || [];
    super(options);
    
    this.lines = [];
    this.class = 'polyline';
    this.strokeWidth = 1;
    
    this.lineOptions = {
      strokeWidth: this.strokeWidth,
      stroke: this.color || 'grey',
      fill: this.fill || false
    };
    
    // Create a group to hold all lines
    this.shape = new Group([], {
      selectable: false,
      hasControls: false,
      class: this.class,
      parent: this
    });
    
    // Create line segments based on provided points
    this.setPoints(this._points);
  }
  
  // Add a point to the polyline
  addPoint(point) {
    this.points.push(new Point(point));
    
    if (this.points.length > 1) {
      const i = this.points.length - 1;
      const j = this.points.length - 2;
      const p1 = this.points[i];
      const p2 = this.points[j];
      
      // Create a new line segment
      const line = new fabric.Line(
        p1.getArray().concat(p2.getArray()), 
        this.lineOptions
      );
      
      // Add to the collection
      this.lines.push(line);
      this.shape.addWithUpdate(line);
    }
  }
  
  // Set all points at once
  setPoints(points = []) {
    this.removeLines();
    this.points = [];
    
    for (let i = 0; i < points.length; i += 1) {
      const point = new Point(points[i]);
      this.points.push(point);
      this.addPoint();
    }
  }
  
  // Remove all line segments
  removeLines() {
    for (let i = 0; i < this.lines.length; i += 1) {
      this.shape.remove(this.lines[i]);
    }
    this.lines = [];
  }
}
```

## Low-Level Shape Classes

The low-level shape classes provide direct extensions of fabric.js shape primitives with minimal customizations specific to the fabric-layers library:

### Circle

```javascript
// Circle.js simplified concept
export class Circle extends fabric.Circle {}
```

### Rect

```javascript
// Rect.js simplified concept
export class Rect extends fabric.Rect {
  constructor(points, options) {
    options = options || {};
    options.strokeWidth = options.strokeWidth || 1;
    options.class = 'rect';
    super(points, options);
    this._strokeWidth = options.strokeWidth;
  }

  // Adjust stroke width based on zoom level
  _renderStroke(ctx) {
    this.strokeWidth = this._strokeWidth / this.canvas.getZoom();
    super._renderStroke(ctx);
  }
}
```

### Line

```javascript
// Line.js simplified concept
export class Line extends fabric.Line {
  // Custom implementations as needed
}
```

## Design Philosophy

The design of the vector module follows several key principles:

1. **Simplicity**: Basic shapes are kept as simple as possible, extending fabric.js classes directly
2. **Extension Point**: Provides building blocks that can be used to create more complex layers
3. **Layer Integration**: The Polyline class demonstrates how to create a full Layer that uses simpler shapes
4. **Consistent Styling**: All shapes follow consistent styling conventions

## Usage Patterns

There are two primary ways to use vector components:

1. **Direct usage** of high-level components (like Polyline):

```javascript
// Create a polyline directly
const points = [[0, 0], [100, 100], [200, 50]];
const polyline = new FabricLayers.Polyline(points, {
  color: 'blue',
  strokeWidth: 2
});
polyline.addTo(map);
```

2. **Custom Layer implementation** using low-level components:

```javascript
// Create a custom layer using vector shapes
class CustomRectLayer extends FabricLayers.Layer {
  constructor(position, size, options) {
    super(options);
    
    // Create the rect shape
    this.shape = new FabricLayers.Rect({
      left: position.x,
      top: position.y,
      width: size.width,
      height: size.height,
      fill: options.fill || 'blue',
      stroke: options.stroke || 'black',
      ...this.style
    });
  }
}
```

## Integration with Other Modules

The vector module integrates with:

- The **Layer** base class for high-level components
- The **Map** module for rendering and interactions
- The **Geometry** module for coordinate handling

This module provides essential building blocks for creating visual elements beyond simple markers, enabling the creation of complex, interactive vector graphics on the map.
