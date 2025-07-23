# Fabric Layers v1.1.6

An interactive coordinate-plane, grid, and layer management library for [fabric.js](https://fabricjs.com/) canvases.

`fabric-layers` is based on the excellent original work of [ReactIndoorMapping](https://github.com/martinwairegi/ReactIndoorMapping) featured in this [blog post](https://blog.logrocket.com/build-indoor-maps-fabric-js-react/). The library has been refactored to be framework-agnostic and upgraded to TypeScript while maintaining all the features of the original.

## 🚀 Running the Grid Demo

To explore the grid functionality, follow these steps:

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Build the Library**
   ```bash
   yarn build
   ```

3. **Open the Demo**
   - Open `grid-demo.html` directly in your browser
   - The demo includes:
     - Interactive grid with zoom/pan functionality
     - Coordinate display
     - Zoom level controls
     - Reset view button

4. **Development Workflow**
   - cd ../fabric-layers-core && npm run build:watch
   - Make changes to the source code
   - Refresh the browser to see changes

## 💻 TypeScript Usage

### Basic Map Setup
```typescript
import { Map, Layer, Point } from 'fabric-layers-core';

// Create a map instance
const map = new Map(document.getElementById('canvas'), {
  width: 800,
  height: 600,
  showGrid: true
});

// Create a layer with type safety
const layer = new Layer({
  draggable: true,
  zIndex: 1,
  class: 'custom-layer'
});

// Use Point class with type checking
const position = new Point(100, 100);
layer.position = position;

// Add layer to map
layer.addTo(map);
```

### Using Paint Tools
```typescript
import { PaintCanvas, Arrow } from 'fabric-layers-core';

// Create a paint canvas with typed options
const canvas = new PaintCanvas(document.getElementById('paint'), {
  width: 800,
  height: 600,
  lineWidth: 2,
  currentColor: '#ff0000'
});

// Create an arrow with proper types
const arrow = new Arrow({ x: 0, y: 0 }, {
  stroke: '#000000',
  strokeWidth: 2
});

canvas.canvas.add(arrow);
```

### Type-Safe Event Handling
```typescript
import { Map } from 'fabric-layers-core';

const map = new Map(document.getElementById('canvas'));

// Event handlers with proper typing
map.on('mode-changed', (mode: string) => {
  console.log(`Mode changed to: ${mode}`);
});

map.on('update', () => {
  const bounds = map.getBounds(); // Returns typed Point[]
  console.log('Map updated', bounds);
});
```

---

## ✨ Classes

```
Base (EventEmitter2)
├── Map (+ ModesMixin)
│   ├── Grid
│   ├── Point
│   └── Measurement
├── Layer
│   ├── Vector Layers (Line, Circle, Rect, Polyline)
│   ├── Marker System
│   │   ├── Marker
│   │   ├── MarkerGroup
│   │   └── Icon
│   ├── Group
│   ├── Connector
│   └── Tooltip
├── Paint System
│   ├── PaintCanvas
│   ├── Arrow
│   ├── ArrowHead
│   └── PaintManager
└── Measurement System
    ├── Measurement
    └── Measurer
```

## 🤝 Contributing

PRs and issues are welcome!
1. Fork & `git clone`
2. `yarn install`
3. `yarn build:watch` – watch/build with TypeScript
4. Add tests in `test/` and run `yarn test`
5. Run `yarn type-check` to verify types

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) spec; CI will lint commit messages.

## 📝 Type Documentation

Complete TypeScript definitions are available in the published package. Key interfaces and types:

- `MapOptions` - Configuration options for Map class
- `LayerOptions` - Configuration for Layer instances
- `Point` & `PointLike` - Coordinate handling
- `GridOptions` - Grid system configuration
- `PaintCanvasOptions` - Paint system options

The library uses strict TypeScript configuration for maximum type safety.

---

## 📄 Licenses

MIT © 2025 [Allen Joslin](https://github.com/ajoslin103) (current author of fabric-layers)

MIT © 2022 [Martin Wairegi](https://github.com/martinwairegi) (original author of ReactIndoorMapping)
