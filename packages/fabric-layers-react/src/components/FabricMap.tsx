import * as React from 'react';
import { createContext, useContext, useRef, useEffect, ReactNode } from 'react';
import * as FabricLayers from 'fabric-layers-core';

interface FabricMapProps {
  width?: number;
  height?: number;
  children?: ReactNode;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  pinOrigin?: 'NONE' | 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT';
  pinMargin?: number;
  zoomOverMouse?: boolean;
}

const FabricContext = createContext<FabricLayers.Map | null>(null);

export const FabricMap: React.FC<FabricMapProps> = ({
  width = 800,
  height = 600,
  zoom = 1,
  minZoom = 0,
  maxZoom = 20,
  pinOrigin = 'NONE',
  pinMargin = 10,
  zoomOverMouse = true,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<FabricLayers.Map | null>(null);

  // Initialize the map
  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const options = {
        width,
        height,
        _options: {
          zoom,
          minZoom,
          maxZoom,
          originPin: pinOrigin,
          pinMargin,
          zoomOverMouse,
          showGrid: true,
          mode: 'GRAB' as const
        }
      };
      mapRef.current = new FabricLayers.Map(containerRef.current, options);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.dispose();
        mapRef.current = null;
      }
    };
  }, []);

  // Update pin origin, margin, and zoom over mouse when they change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setOriginPin(pinOrigin);
      mapRef.current.setPinMargin(pinMargin);
      mapRef.current.setZoomOverMouse(zoomOverMouse);
    }
  }, [pinOrigin, pinMargin, zoomOverMouse]);

  return React.createElement(
    FabricContext.Provider,
    { value: mapRef.current },
    React.createElement('div', { ref: containerRef }),
    children
  );
};

export const useFabricMap = () => useContext(FabricContext);
