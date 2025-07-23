/* global describe, it, before */

import chai from 'chai';
import { fabric } from 'fabric';
import { Map, Marker } from '../src';

window.fabric = fabric;

chai.expect();
const expect = chai.expect;

let lib;

describe('Map Class Tests', () => {
  before(() => {
    lib = new Map({
      canvas: new fabric.Canvas(document.createElement('canvas'))
    });
  });
  
  it('should initialize with a canvas', () => {
    expect(lib.canvas).to.exist;
    expect(lib.canvas).to.be.instanceof(fabric.Canvas);
  });
});

describe('Marker Class Tests', () => {
  before(() => {
    lib = new Marker({
      left: 0,
      top: 0,
    });
  });
  
  it('should initialize with correct type', () => {
    expect(lib.type).to.equal('marker');
  });
});