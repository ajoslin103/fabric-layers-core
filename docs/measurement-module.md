# Measurement Module

## Overview

The `measurement` directory contains tools for measuring distances and areas on the map. This module provides functionality for calculating spatial measurements and visualizing the results, which is essential for many mapping applications that require precise distance or area calculations.

## Structure

```
src/measurement/
├── AreaMeasure.js    # Area calculation functionality
├── DistanceMeasure.js # Distance calculation functionality
├── Measure.js        # Base measurement functionality
└── index.js          # Exports for public API
```

## Measure Base Class

The `Measure` class provides the foundation for all measurement tools. It extends the base `Layer` class and handles the common aspects of measurements, such as:

- Starting and ending measurements
- Tracking measurement points
- Managing measurement state
- Providing hooks for derived classes

```javascript
// Measure.js simplified concept
export class Measure extends Layer {
  constructor(options) {
    options = options || {};
    options.zIndex = options.zIndex || 150;
    super(options);
    
    this.active = false;
    this.points = [];
    this.lines = [];
    this.class = 'measure';
    
    // Initialize shape group to hold measurement visualizations
    this.shape = new Group([], {
      selectable: false,
      hasControls: false,
      class: this.class,
      parent: this
    });
  }
  
  // Start a new measurement
  start(point) {
    this.active = true;
    this.points = [new Point(point)];
    this.drawMeasurement();
  }
  
  // Add a point to the measurement
  addPoint(point) {
    if (!this.active) return;
    this.points.push(new Point(point));
    this.drawMeasurement();
  }
  
  // End the current measurement
  end() {
    this.active = false;
    // Finalize measurement
  }
  
  // Draw the measurement visualization
  // (to be implemented by derived classes)
  drawMeasurement() {}
  
  // Calculate the measurement value
  // (to be implemented by derived classes)
  calculate() {}
}
```

## DistanceMeasure Class

The `DistanceMeasure` class extends the base `Measure` class to specifically handle distance measurements between points. It calculates linear distances along a path of points and visualizes the measurement using lines and text labels.

Key features:
- Linear distance calculation along a path
- Visual line representation with distance labels
- Support for different unit systems
- Real-time updates as points are added

```javascript
// DistanceMeasure.js simplified concept
export class DistanceMeasure extends Measure {
  constructor(options) {
    super(options);
    this.class = 'distancemeasure';
    
    // Set up styling options
    this.lineOptions = {
      stroke: this.color || 'blue',
      strokeWidth: 2,
      // Additional styling...
    };
  }
  
  // Calculate total distance
  calculate() {
    let totalDistance = 0;
    
    for (let i = 1; i < this.points.length; i++) {
      totalDistance += this.points[i-1].distanceTo(this.points[i]);
    }
    
    return totalDistance;
  }
  
  // Draw the measurement visualization
  drawMeasurement() {
    // Clear previous visualization
    this.clearVisualization();
    
    // Draw lines between points
    for (let i = 1; i < this.points.length; i++) {
      const p1 = this.points[i-1];
      const p2 = this.points[i];
      
      // Create a line
      const line = new Line([p1.x, p1.y, p2.x, p2.y], this.lineOptions);
      this.lines.push(line);
      this.shape.add(line);
      
      // Add distance label
      const distance = p1.distanceTo(p2);
      this.addDistanceLabel(p1, p2, distance);
    }
    
    // Add total distance label if multiple segments
    if (this.points.length > 2) {
      const totalDistance = this.calculate();
      this.addTotalDistanceLabel(totalDistance);
    }
  }
  
  // Helper methods for visualization
  addDistanceLabel(p1, p2, distance) {
    // Create and position label
  }
  
  addTotalDistanceLabel(distance) {
    // Create and position total label
  }
  
  clearVisualization() {
    // Remove all lines and labels
  }
}
```

## AreaMeasure Class

The `AreaMeasure` class extends the base `Measure` class to handle area measurements of polygons. It calculates the area of the shape defined by a series of points and visualizes the measurement using a filled polygon and text label.

Key features:
- Polygon area calculation
- Visual polygon representation with area label
- Support for different unit systems
- Real-time updates as points are added

```javascript
// AreaMeasure.js simplified concept
export class AreaMeasure extends Measure {
  constructor(options) {
    super(options);
    this.class = 'areameasure';
    
    // Set up styling options
    this.polygonOptions = {
      fill: this.fill || 'rgba(0, 0, 255, 0.2)',
      stroke: this.stroke || 'blue',
      strokeWidth: 2,
      // Additional styling...
    };
  }
  
  // Calculate area of polygon
  calculate() {
    // Polygon area calculation algorithm
    let area = 0;
    for (let i = 0; i < this.points.length; i++) {
      const j = (i + 1) % this.points.length;
      area += this.points[i].x * this.points[j].y;
      area -= this.points[j].x * this.points[i].y;
    }
    return Math.abs(area / 2);
  }
  
  // Draw the measurement visualization
  drawMeasurement() {
    // Clear previous visualization
    this.clearVisualization();
    
    if (this.points.length < 3) {
      // Draw lines until we have a polygon
      for (let i = 1; i < this.points.length; i++) {
        // Create lines similar to DistanceMeasure
      }
    } else {
      // Create polygon points array
      const polygonPoints = [];
      for (let i = 0; i < this.points.length; i++) {
        polygonPoints.push(this.points[i].x);
        polygonPoints.push(this.points[i].y);
      }
      
      // Create polygon
      const polygon = new Polygon(polygonPoints, this.polygonOptions);
      this.shape.add(polygon);
      
      // Add area label
      const area = this.calculate();
      this.addAreaLabel(area);
    }
  }
  
  // Helper methods for visualization
  addAreaLabel(area) {
    // Create and position label
  }
  
  clearVisualization() {
    // Remove all shapes and labels
  }
}
```

## Integration with Map

The Measurement module integrates with the Map module in several ways:

1. Measurements are added to the map as layers
2. The Map's interaction mode can be set to "MEASURE" to activate measurement tools
3. Mouse events on the map are used to add measurement points
4. The map's coordinate system is used for accurate calculations

```javascript
// Example of integration with Map
map.setMode('MEASURE_DISTANCE');
map.on('click', (e) => {
  if (map.mode === 'MEASURE_DISTANCE') {
    if (!distanceMeasure.active) {
      distanceMeasure.start(e.point);
    } else {
      distanceMeasure.addPoint(e.point);
    }
  }
});
```

## Design Decisions

1. **Extension of Layer class**: Measurements are treated as specialized layers
2. **Real-time visual feedback**: Updates visualization as points are added
3. **Separation of concerns**: Base class handles common functionality, derived classes handle specific measurement types
4. **Integration with map modes**: Measurement tools are activated through map interaction modes

## Usage Examples

```javascript
// Create distance measurement
const distanceMeasure = new FabricLayers.DistanceMeasure({
  color: 'red',
  labelColor: 'black',
  units: 'meters'
});
distanceMeasure.addTo(map);

// Start measurement
distanceMeasure.start([100, 100]);

// Add more points
distanceMeasure.addPoint([200, 150]);
distanceMeasure.addPoint([300, 100]);

// End measurement
distanceMeasure.end();

// Get calculated value
const distance = distanceMeasure.calculate();
```

The Measurement module provides essential functionality for spatial analysis within the fabric-layers-core library, enabling precise distance and area calculations with visual representations.
