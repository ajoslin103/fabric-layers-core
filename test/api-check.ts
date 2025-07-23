// @file: api-check.ts

// Base Classes
import {
    Base,
    Layer,
    Map,
    Point,
    Grid,
    Measurement,
    PaintCanvas,
    Arrow,
    Connector,
    Group,
    Tooltip
} from '../src';

// Type checking each class's public API
function validateAPI() {
    // Map API
    const map = new Map(document.createElement('div'), {
        width: 800,
        height: 600,
        showGrid: true
    });
    map.setZoom(2);
    map.setView({ x: 100, y: 100 });
    map.getBounds();
    
    // Layer API
    const layer = new Layer({
        draggable: true,
        zIndex: 1
    });
    layer.addTo(map);
    layer.setOptions({ opacity: 0.5 });
    
    // Point API
    const point = new Point(10, 20);
    point.add(new Point(5, 5));
    point.multiply(2);
    point.distanceFrom(new Point(0, 0));
    
    // Grid API
    const grid = new Grid(document.createElement('canvas'), {
        distance: 20,
        unit: 10
    });
    grid.setOriginPin('TOP_LEFT');
    grid.setPinMargin(10);
    
    // Paint API
    const paint = new PaintCanvas(document.createElement('div'), {
        lineWidth: 2,
        currentColor: '#000'
    });
    paint.setColor('#ff0000');
    paint.setLineWidth(3);
    
    // Arrow API
    const arrow = new Arrow({ x: 0, y: 0 }, {
        stroke: '#000',
        strokeWidth: 2
    });
    arrow.addPoint({ x: 100, y: 100 });
    
    // Connector API
    const connector = new Connector(
        { position: new Point(0, 0) },
        { position: new Point(100, 100) }
    );
    connector.setColor('#ff0000');
    
    // Measurement API
    const measurement = new Measurement(map);
    measurement.onClick({ absolutePointer: { x: 0, y: 0 } });
    
    // Events should be properly typed
    map.on('update', () => {});
    layer.on('moving', () => {});
    
    return "All APIs successfully type-checked";
}

// This should compile without errors if all types are correct
validateAPI();
