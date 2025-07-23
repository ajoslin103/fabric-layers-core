# Groups vs Layers: Comparing Approaches

## Overview

When working with fabric-layers-core, you have two primary approaches for creating and managing composite objects: fabric.js Groups and fabric-layers Layers. This document compares these approaches to help you choose the right one for your specific needs.

## Fabric.js Groups

### Strengths
- **Native to fabric.js**: Built-in functionality with full support for transformation operations
- **Simple composition**: Easy to combine multiple objects into a single unit
- **Transformation as a unit**: All grouped objects move, scale, and rotate together
- **Selection handling**: Can select and manipulate the entire group at once
- **Nesting support**: Groups can contain other groups for hierarchical structures
- **Performance**: Single object to track in the canvas object list

### Limitations
- **Limited abstraction**: Primarily a visual grouping without additional behavioral logic
- **No built-in event system**: Would need custom code for complex event handling
- **No high-level API**: More code needed for specialized behaviors like "addTo" functionality
- **No inheritance structure**: Cannot easily extend with specialized methods
- **Manual Z-index management**: Must manually handle stacking order

## Fabric-Layers-Core Layers

### Strengths
- **Richer abstraction**: Extends Base with event handling capabilities
- **Common behavior patterns**: Standardized methods like `addTo(map)` across different layer types
- **Built-in event system**: Emits and listens to events for state updates
- **Automatic Z-index management**: Handles proper stacking order
- **Specialized layer types**: Predefined behaviors for markers, polylines, etc.
- **Integration with map**: Designed to work with the map's pan/zoom operations
- **Consistent API**: Common options and methods across different layer implementations

### Limitations
- **Additional abstraction layer**: More complex to understand initially
- **Potential overhead**: More code to process compared to simple groups
- **Learning curve**: Requires understanding the fabric-layers architecture

## When to Use Each Approach

### Use Fabric.js Groups When:
- You need a simple visual grouping of objects
- You're working directly with fabric.js without fabric-layers-core
- You want minimal overhead for simple composite objects
- You need maximum performance for many simple objects
- You're creating custom shapes that don't need map integration

### Use Fabric-Layers-Core Layers When:
- You need integration with the map component
- Your objects require event-based behavior
- You want consistent APIs across different object types
- You need automatic handling of z-index and scaling
- Your application has complex interactive requirements
- You're extending the fabric-layers library with custom components

## Hybrid Approach
In fabric-layers-core, many layer implementations actually use fabric.js Groups internally while wrapping them in the Layer abstraction, getting the best of both worlds:

```javascript
// Example hybrid approach
class CustomLayer extends Layer {
  constructor(options) {
    super(options);
    
    // Create multiple fabric.js objects
    const circle = new Circle({
      radius: 10,
      fill: 'red'
    });
    
    const label = new fabric.Text('Label', {
      fontSize: 12
    });
    
    // Group them together
    this.shape = new fabric.Group([circle, label], {
      left: options.position.x,
      top: options.position.y,
      ...this.style // Apply Layer style to Group
    });
    
    // Now this custom layer can be used with map.addLayer()
  }
  
  // Add Layer-specific methods
  updateLabel(text) {
    // Access the grouped objects
    this.shape.getObjects()[1].set('text', text);
    if (this.shape.canvas) {
      this.shape.canvas.renderAll();
    }
  }
}
```

This pattern uses:
- Groups for visual composition
- Layers for behavioral abstraction and map integration

## Implementation Examples

### Pure Group Example

```javascript
// Using plain fabric.js Group
const circle = new fabric.Circle({
  radius: 10,
  fill: 'red',
  left: 0,
  top: 0
});

const text = new fabric.Text('Label', {
  fontSize: 12,
  left: 20,
  top: 0
});

const group = new fabric.Group([circle, text], {
  left: 100,
  top: 100
});

// Add directly to canvas
canvas.add(group);

// Must manually handle selection, events, etc.
```

### Layer Example

```javascript
// Using fabric-layers-core Layer
const marker = new FabricLayers.Marker([100, 100], {
  label: 'Label',
  color: 'red'
});

// Add to map with consistent API
marker.addTo(map);

// Benefits from Layer functionality
marker.on('click', () => {
  console.log('Marker clicked');
});
```

## Conclusion

Both Groups and Layers have their place in fabric-layers-core applications:

- **Groups** provide efficient, lightweight visual composition
- **Layers** provide rich behavior and integration with the map system

Understanding when to use each approach will help you build more maintainable and efficient applications. Often, the best solution is to use Layers for your application's core objects that need map integration, while using Groups internally to compose complex visual elements.
