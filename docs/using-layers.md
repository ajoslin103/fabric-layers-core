# Using Layers in fabric-layers

The fabric-layers library provides a flexible system for adding various layer types to your canvas. This guide explains the different ways to add layers to a map instance and the available layer types.

## Adding Layers to the Map

After initializing your map instance, you have two main approaches to add layers:

### Option 1: Using the Map.addLayer method

```javascript
// Create a layer (for example, a Marker)
const markerPosition = [100, 100];  // x, y coordinates
const marker = new window.FabricLayers.Marker(markerPosition, {
  // Optional configuration options
  label: 'My Marker',
  color: 'red',
  // Other options like draggable, clickable, etc.
});

// Add the layer to the map
map.addLayer(marker);
```

### Option 2: Using the Layer.addTo method

```javascript
// Create the layer
const marker = new window.FabricLayers.Marker([100, 100], {
  color: 'blue',
  label: 'My Point'
});

// Add to map using the layer's addTo method
marker.addTo(map);
```

## Available Layer Types

The library provides several layer types you can use:

### Marker

Used for point markers on the map.

```javascript
const marker = new window.FabricLayers.Marker([x, y], {
  label: 'Point of interest',
  color: 'red',
  draggable: true,
  clickable: true
});
```

### MarkerGroup

Used for grouped markers or defining rectangular areas.

```javascript
const bounds = [[x1, y1], [x2, y2]]; // top-left and bottom-right corners
const group = new window.FabricLayers.MarkerGroup(bounds, {
  stroke: 'black',
  fill: '#88888822',
  zIndex: 50
});
```

### Connector

Creates a line connecting two points.

```javascript
const startPoint = [x1, y1];
const endPoint = [x2, y2];
const connector = new window.FabricLayers.Connector(startPoint, endPoint, {
  color: 'grey',
  strokeWidth: 2,
  zIndex: 10
});
```

### Polyline, Circle, Rect, Triangle, Etc...

Creates a multi-segment line from an array of points.

```javascript
const points = [[x1, y1], [x2, y2], [x3, y3]]; // Array of points
const polyline = new window.FabricLayers.Polyline(points, {
  color: 'blue',
  strokeWidth: 2
});
```

### Tooltip

Displays text content at a specific position.

```javascript
const tooltip = new window.FabricLayers.Tooltip([x, y], {
  content: 'Hello World',
  textColor: 'black',
  fill: 'white',
  stroke: 'red',
  size: 12, // font size
  zIndex: 300
});
```

## Common Layer Options

All layers accept these common options:

- `zIndex`: Controls the stacking order (higher values appear on top)
- `draggable`: Boolean that determines if the layer can be moved by the user
- `clickable`: Boolean that determines if the layer responds to click events
- `keepOnZoom`: Boolean that determines if the layer maintains size during zoom
- `opacity`: Sets the transparency level (0-1)

## Layer Events

You can listen to events on layers:

```javascript
marker.on('moving', function() {
  console.log('Marker is being moved');
});

marker.on('update:links', function() {
  console.log('Marker links updated');
});
```

## Examples

Here's a complete example of adding multiple layers to a map:

```javascript
// Initialize the map
const map = new window.FabricLayers.Map(container, {
  width: 800,
  height: 600,
  showGrid: true,
  mode: 'GRAB'
});

// Add a marker
const marker1 = new window.FabricLayers.Marker([100, 100], {
  color: 'red',
  label: 'Point A'
});
marker1.addTo(map);

// Add another marker
const marker2 = new window.FabricLayers.Marker([200, 200], {
  color: 'blue',
  label: 'Point B'
});
map.addLayer(marker2);

// Connect the markers with a line
const connector = new window.FabricLayers.Connector(
  marker1.position,
  marker2.position,
  { color: 'green', strokeWidth: 2 }
);
connector.addTo(map);
```