# TypeScript Migration Plan for fabric-layers-core

## Overview

This document outlines the plan for migrating the fabric-layers-core library from JavaScript to TypeScript. As the sole developer, this migration will enable better type safety, improved developer experience, and more maintainable code.

## Pre-Migration Tasks

1. **Analyze the Codebase**
   - ✅ Understand the core architecture and class hierarchy
   - ✅ Identify external dependencies and their types
   - ✅ Review the existing type definitions in `src/types/index.d.ts`

2. **Setup TypeScript Environment**
   - [ ] Install required dependencies
   - [ ] Create `tsconfig.json` configuration
   - [ ] Update build tools (Rollup configuration)

## Migration Strategy

The migration will follow a structured, component-by-component approach:

1. **Core Components First**
   - [ ] `core/Base.js` → `core/Base.ts`
   - [ ] `core/Constants.js` → `core/Constants.ts`

2. **Foundation Classes**
   - [ ] `geometry/Point.js` → `geometry/Point.ts`
   - [ ] `map/Map.js` → `map/Map.ts`
   - [ ] `layer/Layer.js` → `layer/Layer.ts`

3. **Specialized Components**
   - [ ] Grid system
   - [ ] Layer implementations
   - [ ] Measurement utilities
   - [ ] Paint tools

4. **Helper/Utility Functions**
   - [ ] Library utilities in `lib/`

5. **Entry Points**
   - [ ] Main `index.js` → `index.ts`

## Conversion Guidelines

When converting each file:

1. Rename the file extension from `.js` to `.ts`
2. Add explicit types for:
   - Method parameters
   - Return types
   - Class properties
   - Event payloads
3. Create interfaces for options objects
4. Use proper typing for fabric.js objects
5. Add JSDoc comments for public API methods

## Project Structure Changes

```
fabric-layers-core/
├── src/           # TypeScript source files (.ts)
├── dist/          # Compiled output
│   ├── index.cjs.js
│   ├── index.esm.js
│   ├── index.umd.js
│   └── types/     # Generated .d.ts files
├── tsconfig.json  # TypeScript configuration
└── rollup.config.mjs  # Updated build configuration
```

## Development Workflow

1. Convert one component at a time
2. Test each component after conversion
3. Ensure build process generates correct declaration files
4. Verify exported types match the implementation

## Type Definition Strategy

- Use interfaces for object shapes
- Use type aliases for complex types
- Create namespaces for related types
- Export all public types from the main index

## Migration Milestones

### Milestone 1: Setup and Core Types
- [ ] Install TypeScript and dependencies
- [ ] Create initial tsconfig.json
- [ ] Convert Base class and basic types
- [ ] Update build configuration

### Milestone 2: Core Components
- [ ] Convert geometry types and utilities
- [ ] Convert Map class and related components
- [ ] Convert Layer base class
- [ ] Ensure basic functionality works

### Milestone 3: Complete API Coverage
- [ ] Convert all remaining components
- [ ] Ensure complete type coverage
- [ ] Test build process generates proper types
- [ ] Update documentation to reflect TypeScript usage

### Milestone 4: Optimizations and Polish
- [ ] Refine type definitions
- [ ] Add missing JSDoc comments
- [ ] Optimize build configuration
- [ ] Create examples of TypeScript usage
