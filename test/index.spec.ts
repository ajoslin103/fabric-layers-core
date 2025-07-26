// test/index.spec.ts
import chai from 'chai';
import { fabric } from 'fabric';
// Import fabric extensions for proper typing
import '../src/types/fabric-extensions';
// Import specific modules from their index files
import { Map } from '../src/map';
import { Marker } from '../src/layer/marker';

// Declare fabric globally for testing
declare global {
  interface Window {
    fabric: typeof fabric;
  }
}

// Make fabric available globally
window.fabric = fabric;

// Set up chai
const expect = chai.expect;

let lib: any;

describe('Map Class Tests', () => {
  before(() => {
    // Create a container div for the map
    const containerDiv = document.createElement('div');
    document.body.appendChild(containerDiv);
    
    // Create map using the container∂
    lib = new Map(containerDiv, {
      width: 500,
      height: 500
    });
  });
  
  it('should initialize with a canvas', () => {
    expect(lib.canvas).to.exist;
    expect(lib.canvas).to.be.instanceof(fabric.Canvas);
  });
});

describe('Marker Class Tests', () => {
  before(() => {
    // Create marker with position as first parameter and options as second parameter
    // The Marker constructor expects position: PointLike followed by options
    lib = new Marker({ x: 0, y: 0 }, {
      text: 'Test Marker',
      size: 10
    });
  });
  
  it('should initialize with correct type', () => {
    expect(lib.type).to.equal('marker');
  });
});
