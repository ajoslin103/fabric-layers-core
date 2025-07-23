// @file: interface-check.ts

import {
    MapOptions,
    LayerOptions,
    GridOptions,
    PaintCanvasOptions,
    ArrowOptions,
    ConnectorOptions,
    TooltipOptions
} from '../src';

// Should compile if all interfaces are properly defined
const mapOpts: MapOptions = {
    width: 800,
    height: 600,
    showGrid: true,
    zoomEnabled: true,
    panEnabled: true
};

const layerOpts: LayerOptions = {
    draggable: true,
    zIndex: 1,
    opacity: 0.8,
    class: 'custom-layer'
};

const gridOpts: GridOptions = {
    distance: 20,
    unit: 10,
    color: '#000',
    lineWidth: 1
};

const paintOpts: PaintCanvasOptions = {
    width: 800,
    height: 600,
    lineWidth: 2,
    currentColor: '#000'
};

const arrowOpts: ArrowOptions = {
    strokeWidth: 2,
    stroke: '#000',
    class: 'arrow'
};

const connectorOpts: ConnectorOptions = {
    strokeWidth: 1,
    color: '#000',
    fill: false
};

const tooltipOpts: TooltipOptions = {
    content: 'Test',
    size: 10,
    textColor: '#000',
    fill: '#fff'
};

// Export to ensure TypeScript checks the types
export const interfaceValidation = {
    mapOpts,
    layerOpts,
    gridOpts,
    paintOpts,
    arrowOpts,
    connectorOpts,
    tooltipOpts
};
