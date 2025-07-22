# TypeScript Conversion Instructions for fabric-layers-core

These instructions apply **ONLY** to the `packages/fabric-layers-core` package within the monorepo. Other packages will remain JavaScript-based for now.

## Initial Setup

1. **Ensure Correct Node.js Version and Package Manager**

```bash
# Navigate to the monorepo root
cd /Users/ajoslin/Development/fabric-layers

# Activate the correct Node version
nvm use

# Navigate to the core package
cd packages/fabric-layers-core

# Install TypeScript and type definitions using Yarn (NOT npm)
yarn add -D typescript @rollup/plugin-typescript @types/fabric-pure-browser @types/eventemitter2 tslib
```

2. **Copy Configuration Files**

Copy the `tsconfig.json` and `rollup.config.mjs` files from the `typescript-migration` directory to the `packages/fabric-layers-core` package directory.

## File Conversion Process

For each file in the codebase, follow these steps:

### Step 1: Rename and Initial Conversion

1. Rename the file from `.js` to `.ts`
2. Fix any immediate TypeScript errors

### Step 2: Add Type Annotations

1. **Class Properties**
   ```typescript
   // Before
   class Example {
     constructor() {
       this.value = 5;
     }
   }

   // After
   class Example {
     value: number;
     
     constructor() {
       this.value = 5;
     }
   }
   ```

2. **Method Parameters and Return Types**
   ```typescript
   // Before
   calculate(x, y) {
     return x + y;
   }

   // After
   calculate(x: number, y: number): number {
     return x + y;
   }
   ```

3. **Interface Definitions for Objects**
   ```typescript
   // Before
   function createLayer(options) {
     // ...
   }

   // After
   interface LayerOptions {
     visible?: boolean;
     opacity?: number;
     // ...other options
   }

   function createLayer(options: LayerOptions): Layer {
     // ...
   }
   ```

### Step 3: Handle fabric.js Types

1. Import types from `fabric-pure-browser`
   ```typescript
   import { Canvas, Object as FabricObject, IEvent } from 'fabric-pure-browser';
   ```

2. Use specific fabric.js types
   ```typescript
   // Before
   addObject(obj) {
     this.canvas.add(obj);
   }

   // After
   addObject(obj: FabricObject): void {
     this.canvas.add(obj);
   }
   ```

### Step 4: Improve Event Handling

1. Define event types using string literals or interfaces
   ```typescript
   type LayerEvent = 'added' | 'removed' | 'moving' | 'moved';

   interface LayerMovedEvent {
     layer: Layer;
     position: Point;
   }
   
   // Then in methods:
   on(event: LayerEvent, handler: (data: LayerMovedEvent) => void): this {
     // ...
   }
   ```

## Common Issues and Solutions

### 1. Type Assertion When Necessary

```typescript
// When TypeScript can't infer the correct type
const element = document.getElementById('canvas') as HTMLCanvasElement;
```

### 2. Handle Dynamic Properties

```typescript
// For objects with dynamic properties
interface DynamicOptions {
  [key: string]: any;
}
```

### 3. Module Imports

```typescript
// For non-TypeScript modules without type definitions
declare module 'some-module';
```

### 4. Class Mixins

```typescript
// For the mix pattern used in the Map class
type Constructor<T = {}> = new (...args: any[]) => T;

function ModesMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    // Mixin methods and properties
  };
}
```

## Testing Your Conversion

After converting each file or component:

1. Run the type checker: `yarn type-check`
2. Try building the library: `yarn build`
3. Test the output to ensure functionality is preserved

## Final Steps

Once all files are converted:

1. Update import statements in examples and tests
2. Update documentation to reflect TypeScript usage
3. Verify all types are correctly exported from the main index
4. Create a small test app to verify functionality
