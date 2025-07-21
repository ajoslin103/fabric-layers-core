# Fabric Layers Core Documentation

## Overview

This directory contains comprehensive documentation for the `fabric-layers-core` library, a JavaScript library built on top of fabric.js that provides a powerful system for creating interactive, canvas-based maps with support for layers, grids, measurements, and drawing tools.

## Documentation Structure

The documentation is organized to parallel the source code structure, with dedicated files for each module in the library. This makes it easy to find information about specific components and understand how they fit into the overall architecture.

## Getting Started

If you're new to fabric-layers-core, we recommend starting with these documents:

1. [Architecture Overview](architecture-overview.md) - High-level understanding of the library's structure
2. [Using Layers](using-layers.md) - Practical guide to adding and working with layers
3. [Understanding Layers](understanding-layers.md) - Deeper dive into the layer architecture

## Core Concepts

* [Groups vs Layers](groups-vs-layers.md) - Comparing two approaches to managing composite objects

## Module Documentation

### Core Components

* [Core Module](core-module.md) - Base classes and constants
* [Geometry Module](geometry-module.md) - Point class and geometric operations
* [Map Module](map-module.md) - Central canvas management and integration

### Layer System

* [Layer Module](layer-module.md) - Layer system overview
  * [Layer Marker Module](layer-marker-module.md) - Point-based markers
  * [Layer Vector Module](layer-vector-module.md) - Vector shapes (lines, polygons)

### Specialized Modules

* [Grid Module](grid-module.md) - Coordinate grid system
* [Measurement Module](measurement-module.md) - Distance and area measurements
* [Paint Module](paint-module.md) - Drawing and annotation tools

## Document Descriptions

| Document | Description |
|----------|-------------|
| [architecture-overview.md](architecture-overview.md) | High-level overview of the fabric-layers-core architecture, directory structure, module relationships, key concepts, and design patterns |
| [core-module.md](core-module.md) | Documentation of the core module, including Base class, constants, and design decisions |
| [geometry-module.md](geometry-module.md) | Details about the Point class and geometric operations used throughout the library |
| [grid-module.md](grid-module.md) | Documentation of the grid system for coordinate visualization |
| [groups-vs-layers.md](groups-vs-layers.md) | Comparison between fabric.js Groups and fabric-layers Layers, with usage recommendations |
| [layer-marker-module.md](layer-marker-module.md) | Documentation of the marker system for point-based visualization |
| [layer-module.md](layer-module.md) | Overview of the layer system architecture and common functionality |
| [layer-vector-module.md](layer-vector-module.md) | Documentation of vector shapes like polylines, circles, and rectangles |
| [map-module.md](map-module.md) | Details about the Map class that serves as the central component |
| [measurement-module.md](measurement-module.md) | Documentation of distance and area measurement tools |
| [paint-module.md](paint-module.md) | Information about drawing and annotation capabilities |
| [understanding-layers.md](understanding-layers.md) | In-depth explanation of the two-tier layer architecture |
| [using-layers.md](using-layers.md) | Practical guide to creating and using different types of layers |

## Development

When extending or modifying the library, it's recommended to keep the documentation in sync with the code. Follow the existing structure and organization when adding new documentation files.

## Contributing

If you find issues or have suggestions for improving these docs, please contribute by submitting pull requests or opening issues in the repository.
