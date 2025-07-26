// test/setup.ts
/**
 * This is a test setup file for configuring JSDOM in a Node.js environment.
 * It provides the necessary DOM elements for testing fabric.js components.
 * 
 * Note: This file must be loaded using CommonJS require() due to Mocha's test framework requirements.
 */

// @ts-nocheck - Disable TypeScript checks for this file to avoid DOM/Node.js global conflicts

// Use CommonJS require instead of ES modules for better Mocha compatibility
const { JSDOM } = require('jsdom');

// Set up JSDOM with a minimal HTML document
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true
});

// Get the window from JSDOM
const domWindow = dom.window;

// Assign JSDOM window and document to global scope
global.window = domWindow;
global.document = domWindow.document;
global.navigator = {
  userAgent: 'node.js',
};

// Required DOM elements for fabric.js
global.HTMLCanvasElement = domWindow.HTMLCanvasElement;
global.HTMLImageElement = domWindow.HTMLImageElement;
global.Image = domWindow.Image;
global.Document = domWindow.Document;
global.HTMLDocument = domWindow.HTMLDocument;
global.Element = domWindow.Element; // Add Element definition for Fabric.js

// Mock requestAnimationFrame/cancelAnimationFrame since they don't exist in Node.js
global.requestAnimationFrame = function(callback) {
  return setTimeout(callback, 0);
};

global.cancelAnimationFrame = function(id) {
  clearTimeout(id);
};

// Add 'self' reference, needed by some browser APIs
Object.defineProperty(global, 'self', {
  value: domWindow,
  configurable: true,
  writable: true
});

// Use CommonJS exports
module.exports = {};
