# Layer Marker Module

## Overview

The `layer/marker` directory contains implementations for point-based markers in the fabric-layers-core library. Markers are interactive elements positioned at specific coordinates on the map, often used to highlight locations or serve as interaction points.

## Structure

```
src/layer/marker/
├── Marker.js       # Core marker implementation
├── MarkerGroup.js  # Group of related markers or area
├── index.js        # Exports for public API
```

## Marker Class

The `Marker` class is the foundation for point-based visualization. It extends the base `Layer` class and provides functionality for displaying points on the map with various visual representations.

Key features:
- Positioning at specific coordinates
- Visual customization (color, size, icon)
- Optional text labels
- Draggable behavior
- Event handling for interactions
- Connection capabilities with other markers

```javascript
// Marker.js simplified concept
export class Marker extends Layer {
  constructor(position, options) {
    options = options || {};
    options.zIndex = options.zIndex || 100;
    options.keepOnZoom = options.keepOnZoom === undefined ? true : options.keepOnZoom;
    options.position = new Point(position);
    options.clickable = options.clickable !== undefined ? options.clickable : true;
    options.class = 'marker';
    super(options);
    
    // Initialize marker properties
    this.text = this.text || '';
    this.size = this.size || 10;
    this.textColor = this.textColor || 'black';
    this.fill = this.fill || 'white';
    this.stroke = this.stroke || 'red';
    
    // Create visual representation
    this.circle = new fabric.Circle({
      radius: this.size,
      strokeWidth: 2,
      stroke: this.stroke,
      fill: this.fill
    });
    
    // Initialize marker and setup listeners
    this.init();
  }
  
  init() {
    // Create the marker's fabric.js shape
    const objects = [];
    if (this.circle) objects.push(this.circle);
    if (this.textObj) objects.push(this.textObj);
    
    this.shape = new Group(objects, this.style);
    
    // Register event listeners
    this.registerListeners();
  }
  
  // Update marker position
  setPosition(position) {
    this.position = new Point(position);
    if (!this.shape) return;
    
    this.shape.set({
      left: this.position.x,
      top: this.position.y
    });
    
    // Update connections and trigger events
    this.emit('update:links');
    
    if (this.shape.canvas) {
      this.shape.canvas.renderAll();
    }
  }
  
  // Additional methods...
}
```

## MarkerGroup Class

The `MarkerGroup` class represents a rectangular area on the map, defined by its bounds. It's useful for highlighting regions or grouping related elements.

Key features:
- Defined by corner coordinates
- Customizable fill and border styles
- Events for interactions with the group
- Methods for adjusting bounds

```javascript
// MarkerGroup.js simplified concept
export class MarkerGroup extends Layer {
  constructor(bounds, options) {
    options = options || {};
    options.bounds = bounds;
    options.zIndex = options.zIndex || 50;
    options.class = 'markergroup';
    super(options);
    
    // Initialize styling
    this.style = {
      strokeWidth: 1,
      stroke: this.stroke || 'black',
      fill: this.color || '#88888822',
      // Additional style properties...
    };
    
    this.bounds = bounds;
    this.draw();
  }
  
  draw() {
    // Calculate dimensions from bounds
    const width = this.bounds[1][0] - this.bounds[0][0];
    const height = this.bounds[1][1] - this.bounds[0][1];
    
    // Create shape with calculated dimensions
    this.shape = new Rect(/* ... */);
  }
}
```

## Marker Connections

A key feature of the marker system is the ability to create connections between markers. This is implemented through:

1. The `Marker` class's `links` property that defines connections
2. The `Connector` class (from the parent layer directory) that visualizes these connections
3. Event handling that updates connections when markers move

## Integration with Map

Markers integrate with the Map component in several ways:

- Auto-scaling behavior controlled by `keepOnZoom` property
- Event propagation for interactions
- Z-index management for proper stacking
- Coordinate transformations during pan and zoom operations

## Design Decisions

1. **Visual flexibility**: Markers can be represented as circles, icons, or custom shapes
2. **Event-driven updates**: Uses the event system for handling interactions and updates
3. **Connection support**: Built-in functionality for connecting markers with lines
4. **Default interaction behavior**: Markers are clickable and provide hover feedback by default

## Usage Examples

```javascript
// Create a basic marker
const marker = new FabricLayers.Marker([100, 100], {
  color: 'red',
  label: 'Point of interest',
  draggable: true
});

// Add to map
marker.addTo(map);

// Create a marker group (rectangular area)
const bounds = [[50, 50], [150, 150]]; // [[top-left], [bottom-right]]
const area = new FabricLayers.MarkerGroup(bounds, {
  fill: 'rgba(0, 128, 255, 0.2)',
  stroke: 'blue'
});

// Add to map
area.addTo(map);
```

The Marker module provides a robust foundation for creating interactive point-based elements on the map, supporting a wide range of use cases from simple location markers to complex interconnected elements.
