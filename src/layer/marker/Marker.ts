import { fabric } from 'fabric';
import { Layer, LayerOptions } from '../Layer';
import { Group } from '../Group';
import { Point, PointLike } from '../../geometry/Point';
import { Connector } from '../Connector';
import { ExtendedFabricGroup } from '../../types/fabric-extensions';

export interface MarkerOptions extends LayerOptions {
  rotation?: number;
  yaw?: number;
  textColor?: string;
  text?: string;
  size?: number;
  fill?: string | boolean;
  stroke?: string;
  icon?: {
    url: string;
    [key: string]: any;
  };
}

export class Marker extends Layer {
  public position: Point;
  public rotation: number;
  public yaw: number;
  public text: string;
  public size: number;
  public textColor: string;
  public fill: string | boolean;
  public stroke: string;
  public links: any[] = [];
  public textObj?: fabric.Text;
  public image?: fabric.Image;
  public circle?: fabric.Circle;
  // public shape: ExtendedFabricGroup; // inherited from Layer
  public connectors: Connector[] = [];
  public style: any;
  public icon?: {
    url: string;
    [key: string]: any;
  };

  private dragStart: fabric.IEvent | null = null;
  private dragging: boolean = false;

  constructor(position: PointLike, options: MarkerOptions = {}) {
    options.zIndex = options.zIndex || 100;
    options.keepOnZoom = options.keepOnZoom === undefined ? true : options.keepOnZoom;
    options.position = new Point(position);
    options.rotation = options.rotation || 0;
    options.yaw = options.yaw || 0;
    options.clickable = options.clickable !== undefined ? options.clickable : true;
    options.class = 'marker';
    super(options);

    const vm = this;

    this.position = new Point(position);
    this.rotation = options.rotation || 0;
    this.yaw = options.yaw || 0;
    this.text = options.text || '';
    this.size = options.size || 10;
    this.textColor = options.textColor || 'black';
    this.fill = options.fill || 'white';
    this.stroke = options.stroke || 'red';
    this.icon = options.icon;

    Object.assign(this.style, {
      left: this.position.x,
      top: this.position.y,
      angle: this.rotation,
      yaw: this.yaw,
      clickable: this.clickable
    });

    if (this.text) {
      this.textObj = new fabric.Text(this.text, {
        fontSize: this.size,
        fill: this.textColor
      });
    }

    if (this.icon) {
      fabric.Image.fromURL(
        this.icon.url,
        (image: fabric.Image) => {
          vm.image = image.scaleToWidth(this.size);
          this.init();
        },
        {
          selectable: false,
          evented: this.clickable,
          opacity: this.opacity,
          clickable: this.clickable
        } as fabric.IImageOptions & { clickable: boolean }
      );
    } else {
      this.circle = new fabric.Circle({
        radius: this.size,
        strokeWidth: 2,
        stroke: this.stroke,
        fill: this.fill as string
      });
      this.init();
    }
  }

  init(): void {
    const objects: fabric.Object[] = [];
    if (this.image) {
      objects.push(this.image);
    }
    if (this.circle) {
      objects.push(this.circle);
    }
    if (this.textObj) {
      objects.push(this.textObj);
    }
    this.shape = new Group(objects, this.style) as ExtendedFabricGroup;
    this.links = this.links || [];
    this.addLinks();
    this.registerListeners();

    // Use setTimeout instead of process.nextTick for browser compatibility
    setTimeout(() => {
      this.emit('ready');
    }, 0);
  }

  registerListeners(): void {
    const vm = this;
    this.shape.on('moving', () => {
      vm.onShapeDrag();
    });
    this.shape.on('rotating', () => {
      vm.emit('rotating');
    });

    this.shape.on('mousedown', (e: fabric.IEvent) => {
      vm.onShapeMouseDown(e);
    });
    this.shape.on('mousemove', (e: fabric.IEvent) => {
      vm.onShapeMouseMove(e);
    });
    this.shape.on('mouseup', (_e: fabric.IEvent) => {
      vm.onShapeMouseUp();
    });
    this.shape.on('mouseover', () => {
      vm.emit('mouseover', vm);
    });
    this.shape.on('mouseout', () => {
      vm.emit('mouseout', vm);
    });
  }

  setPosition(position: PointLike): void {
    this.position = new Point(position);
    if (!this.shape) return;

    this.shape.set({
      left: this.position.x,
      top: this.position.y
    });

    this.emit('update:links');

    if (this.shape.canvas) {
      this.shape.canvas.renderAll();
    }
  }

  setRotation(rotation: number): void {
    this.rotation = rotation;

    if (!this.shape) return;

    this.shape.set({
      angle: this.rotation
    });

    if (this.shape.canvas) {
      this.shape.canvas.renderAll();
    }
  }

  setOptions(options: Partial<MarkerOptions>): void {
    if (!this.shape) return;

    Object.keys(options).forEach(key => {
      switch (key) {
        case 'textColor':
          this.setTextColor(options.textColor as string);
          break;
        case 'stroke':
          this.setStroke(options.stroke as string);
          break;
        case 'fill':
          this.setColor(options.fill as string);
          break;

        default:
          break;
      }
    });
    if (this.shape.canvas) {
      this.shape.canvas.renderAll();
    }
  }

  setTextColor(color: string): void {
    if (this.text && this.textObj) {
      this.textObj.set('fill', color);
      if (this.textObj.canvas) {
        this.textObj.canvas.renderAll();
      }
    }
  }

  setText(text: string): void {
    if (this.text && this.textObj) {
      this.textObj.set({ text });
      if (this.textObj.canvas) {
        this.textObj.canvas.renderAll();
      }
    }
  }

  setStroke(color: string): void {
    if (this.circle) {
      this.circle.set('stroke', color);
    }
  }

  setColor(color: string | boolean): void {
    if (this.circle) {
      this.circle.set('fill', color as string);
    }
  }

  setLinks(links: any[]): void {
    this.links = links;
    this.addLinks();
  }

  setSize(size: number): void {
    if (this.image) {
      this.image.scaleToWidth(size);
      if (this.image.canvas) {
        this.image.canvas.renderAll();
      }
    } else if (this.circle) {
      this.circle.set('radius', size);
    }
  }

  addLinks(): void {
    this.connectors = [];
    this.links.forEach(link => {
      const connector = new Connector(this, link);
      this.connectors.push(connector);
    });

    this.addConnectors();
  }

  addConnectors(): void {
    const vm = this;
    this.connectors.forEach(connector => {
      // Use type assertion to handle type compatibility with Map.Layer interface
      vm._map?.addLayer(connector as unknown as Layer);
    });
  }

  onAdded(): void {
    this.addConnectors();
  }

  onShapeDrag(): void {
    const matrix = this.shape.calcTransformMatrix();
    const [, , , , x, y] = matrix;
    this.position = new Point(x, y);
    this.emit('update:links');
    this.emit('moving');
  }

  onShapeMouseDown(e: fabric.IEvent): void {
    this.dragStart = e;
  }

  onShapeMouseMove(e: fabric.IEvent): void {
    if (this.dragStart) {
      this.emit('dragstart');

      const a = new fabric.Point(e.pointer?.x || 0, e.pointer?.y || 0);
      const b = new fabric.Point(
        this.dragStart.pointer?.x || 0, 
        this.dragStart.pointer?.y || 0
      );
      
      // if distance is far enough, we don't want to fire click event
      if (a.distanceFrom(b) > 3) {
        this.dragStart = null;
        this.dragging = true;
      }
    }

    if (this.dragging) {
      this.emit('drag');
    } else {
      this.emit('hover');
    }
  }

  onShapeMouseUp(): void {
    if (!this.dragging) {
      this.emit('click');
    } else {
      this.emit('moved');
    }
    this.dragStart = null;
    this.dragging = false;
  }
}

export const marker = (position: PointLike, options?: MarkerOptions): Marker => new Marker(position, options);

export default Marker;
