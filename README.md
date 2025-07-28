# Fabric Layers v1.1.5

An interactive coordinate-plane, grid, and layer management library for [fabric.js](https://fabricjs.com/) canvases.

`fabric-layers` is based on the excellent original work of [ReactIndoorMapping](https://github.com/martinwairegi/ReactIndoorMapping) featured in this [blog post](https://blog.logrocket.com/build-indoor-maps-fabric-js-react/). The library has been refactored to be framework-agnostic while maintaining all the features of the original.

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
│   ├── Canvas
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
2. `npm install`
3. `npm run dev` – watch/build
4. Add tests in `test/` and run `npm test`

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) spec; CI will lint commit messages.

---

## 📄 Licenses

MIT © 2025 [Allen Joslin](https://github.com/ajoslin103) (current author of fabric-layers)

MIT © 2022 [Martin Wairegi](https://github.com/martinwairegi) (original author of ReactIndoorMapping)