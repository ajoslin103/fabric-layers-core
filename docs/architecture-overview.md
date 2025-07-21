# Architecture Overview

## Introduction

The `fabric-layers-core` library provides a powerful system for creating interactive, canvas-based maps with support for layers, grids, measurements, and drawing tools. It is built on top of [fabric.js](http://fabricjs.com/), a powerful JavaScript canvas library, and extends it with specialized functionality for mapping and spatial applications.

## Directory Structure

The library follows a modular architecture with a clear separation of concerns. The source code is organized into logical directories, each handling specific functionality:

```
src/
├── core/       # Base abstractions and constants
├── geometry/   # Geometric primitives and utilities
├── grid/       # Grid system implementation
├── layer/      # Layer system and components
│   ├── marker/ # Point-based marker implementations
│   └── vector/ # Vector shape implementations
├── map/        # Canvas and interaction modes
├── measurement/ # Distance and area measurement tools
├── paint/      # Drawing and painting capabilities
└── types/      # TypeScript definitions
```

This structure makes the codebase more maintainable and easier to navigate, with each module having a clear responsibility.

## Module Relationships

The fabric-layers-core architecture is based on a hierarchical relationship between modules:

1. **Core**: Provides fundamental abstractions used by all other modules
2. **Geometry**: Supplies basic spatial primitives used throughout the library
3. **Map**: Central component that integrates all other modules
4. **Layer**: Components that render on the map
5. **Specialized modules** (Grid, Measurement, Paint): Provide additional functionality

![Module Dependencies](https://mermaid.ink/img/pako:eNptkU1qw0AMha8itGohF-gqi0JpIIGku-66EDRjT2LwjIxGhkDIwWfRE-UKHTsEWhbS6NN7T08ajGocFFrVHnqiwdHgwVMklY0flcHXOI5MTmfQaYYj9SxPD8pHv4dty0_wdQ5A47hCrn0dtQY_lbCmCT_UMlVpQhMo4xaDU4kjfFFG3KbMyqvXl-eXHZxJ_V8zT8yi6LSxT_pmt4IyXaD1yV2lMPqXKIsnJ_oRfb9oxcOrXlbHVcqJO04s27smtJ3J4XcwvLVCbdE7Giy3XJRlOYdzaTZlGkHrUNVkxWWpLosE1dCOZDkU4HnfXCnvWjRQuohXmlbhsOgAa2W-IaP9AWQSdL0?type=png)

## Key Concepts

### Base Class

The `Base` class, found in the core module, is the foundation of most objects in the library. It provides:

- Event handling through EventEmitter2 inheritance
- Common option processing
- Standardized initialization patterns

This allows components throughout the library to communicate via events and follow consistent patterns.

### Layer System

The layer system is a key architectural element that provides a structured way to add visual elements to the map. It follows a two-tier design:

1. **High-Level Layers**: Extend the `Layer` base class and provide complete functionality
2. **Low-Level Shapes**: Extend fabric.js classes directly for basic shape functionality

This design allows for both simplicity when needed and rich functionality for complex components. For more details, see [Understanding Layers](understanding-layers.md).

### Map Component

The `Map` class serves as the central controller of the library, managing:

- The canvas element and rendering
- Layer management and z-ordering
- Interaction modes (pan, zoom, select, draw)
- Grid system integration
- Event coordination

The Map integrates all other components into a cohesive whole and provides the main API for applications.

## Design Patterns

The library employs several design patterns to achieve its goals:

### Event-Based Communication

Components communicate primarily through events rather than direct method calls. This promotes loose coupling and flexibility, allowing components to react to changes without tight dependencies.

Example:
```javascript
// Component A emits an event
this.emit('position:changed', { x: 10, y: 20 });

// Component B listens for the event
otherComponent.on('position:changed', (data) => {
  console.log(`Position changed to ${data.x}, ${data.y}`);
});
```

### Mixins

The library uses mixins to compose functionality into classes without deep inheritance hierarchies. For example, the `ModesMixin` adds interaction mode support to the Map class.

Example:
```javascript
// Define mixin
const ModesMixin = {
  setMode(mode) { /* ... */ },
  // Additional methods
};

// Apply mixin to class
export class Map extends mix(Base).with(ModesMixin) {
  // Map implementation
}
```

### Factory Functions

Some components use factory functions to create instances with specific configurations, promoting code reuse and simplifying complex object creation.

Example:
```javascript
function createDefaultMarker(position, options) {
  return new Marker(position, {
    color: 'red',
    radius: 10,
    ...options
  });
}
```

## Extension Points

The library is designed to be extensible in several ways:

1. **Custom Layers**: Create new layer types by extending the `Layer` class
2. **Custom Shapes**: Create new shape types by extending fabric.js classes
3. **Map Extensions**: Enhance the Map class with additional functionality
4. **Event Handlers**: Add custom behavior by listening to events

## Performance Considerations

The library includes several optimizations to maintain good performance:

- Efficient rendering through fabric.js
- Z-index sorting to minimize canvas redraws
- Event throttling for high-frequency interactions
- Lazy initialization of components
- Configurable detail levels for complex visualizations

## Browser Compatibility

fabric-layers-core supports modern browsers with good canvas support:

- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers with touch support
- IE11 support requires additional polyfills

## Integration Approach

The library is designed to be used in different ways:

1. **Standalone**: Direct usage in web applications
2. **Framework Integration**: Used with React, Vue, Angular, etc.
3. **Module System**: Compatible with ES modules, CommonJS, and global exports

## Conclusion

The fabric-layers-core architecture is designed around principles of modularity, extensibility, and performance. By organizing functionality into distinct modules and using patterns like event-based communication and mixins, the library provides a flexible and powerful foundation for building interactive canvas applications.

For more detailed information about specific modules, refer to their respective documentation files.
