import { expect } from 'chai';
import { fabric } from 'fabric';
import { createTestContainer, cleanupTestContainer } from '../helpers/setup';
import { Map } from '../../src/map/Map';
import { ExtendedFabricObject } from '../../src/types/fabric-extensions';
import { Layer } from '../../src/layer';

describe('Map', () => {
  let container: HTMLDivElement;
  let map: Map;

  beforeEach(() => {
    container = createTestContainer();
    map = new Map(container, {
      width: 800,
      height: 600,
      showGrid: false
    });
  });

  afterEach(() => {
    if (map) {
      map.canvas.dispose();
    }
    cleanupTestContainer(container);
  });

  describe('Initialization', () => {
    it('should create a map instance', () => {
      expect(map).to.be.an.instanceOf(Map);
    });

    it('should create a canvas element', () => {
      const canvas = container.querySelector('canvas');
      expect(canvas).to.exist;
      // TypeScript null check - we've verified it exists above, so we can safely assert it's not null
      expect(canvas!.id).to.equal('fabric-layers-canvas');
    });

    it('should initialize with default options', () => {
      expect(map.get('width')).to.equal(800);
      expect(map.get('height')).to.equal(600);
      expect(map.get('showGrid')).to.be.false;
    });
  });

  describe('Grid', () => {
    it('should add grid when showGrid is true', () => {
      const mapWithGrid = new Map(container, { showGrid: true });
      const gridCanvas = container.querySelector('#fabric-layers-grid-canvas');
      expect(gridCanvas).to.exist;
      mapWithGrid.canvas.dispose();
    });
  });

  describe('Layers', () => {
    it('should add a layer', () => {
      const layer = {
        shape: new fabric.Rect({
          left: 100,
          top: 100,
          width: 50,
          height: 50,
          fill: 'red'
        }) as unknown as ExtendedFabricObject,
        class: 'test'
      };
      
      return new Promise<void>((resolve) => {
        map.on('test:added', (addedLayer) => {
          expect(addedLayer).to.equal(layer);
          expect(map.canvas.getObjects()).to.include(layer.shape);
          resolve();
        });
        
        map.addLayer(layer as Layer);
      });
    });

    it('should remove a layer', () => {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 50,
        height: 50,
        fill: 'blue'
      }) as unknown as ExtendedFabricObject;
      
      const layer = { shape: rect, class: 'test' };
      
      return new Promise<void>((resolve) => {
        map.addLayer(layer as Layer);
        
        map.on('test:removed', (removedLayer) => {
          expect(removedLayer).to.equal(layer);
          expect(map.canvas.getObjects()).to.not.include(rect);
          resolve();
        });
        
        map.removeLayer(layer as Layer);
      });
    });
  });
});
