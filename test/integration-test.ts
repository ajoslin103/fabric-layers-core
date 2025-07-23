// @file: integration-test.ts

import { Map, Layer, Point, Arrow, Connector, PaintCanvas, Grid } from '../src';

function integrationTest() {
    // Create base map
    const container = document.createElement('div');
    const map = new Map(container, {
        width: 800,
        height: 600,
        showGrid: true
    });

    // Add grid
    const gridCanvas = document.createElement('canvas');
    const grid = new Grid(gridCanvas, {
        distance: 20,
        unit: 10
    });
    grid.setOriginPin('TOP_LEFT');

    // Add paint canvas
    const paintCanvas = new PaintCanvas(container, {
        lineWidth: 2,
        currentColor: '#000'
    });

    // Create and connect points
    const point1 = new Point(100, 100);
    const point2 = new Point(200, 200);

    // Create arrow
    const arrow = new Arrow(point1, {
        stroke: '#000',
        strokeWidth: 2
    });
    arrow.addPoint(point2);
    paintCanvas.canvas.add(arrow);

    // Create connector between points
    const startLayer = new Layer({ position: point1 });
    const endLayer = new Layer({ position: point2 });
    const connector = new Connector(startLayer, endLayer, {
        strokeWidth: 1,
        color: '#000'
    });

    // Add everything to map
    startLayer.addTo(map);
    endLayer.addTo(map);
    connector.addTo(map);

    // Test event handling
    map.on('update', () => {
        const bounds = map.getBounds();
        console.log('Map bounds:', bounds);
    });

    // Event propagation
    startLayer.on('moving', () => {
        connector.redraw();
    });

    return {
        map,
        grid,
        paintCanvas,
        arrow,
        connector,
        startLayer,
        endLayer
    };
}

export const test = integrationTest();
