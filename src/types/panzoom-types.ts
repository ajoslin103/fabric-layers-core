import { PanzoomEvent, PanzoomCallback } from '../lib/panzoom';

/**
 * Enhanced PanzoomEvent with guaranteed isRight property
 */
export interface EnhancedPanzoomEvent extends PanzoomEvent {
  // Make isRight non-optional and ensure it's always boolean
  isRight: boolean;
}

/**
 * Adapter callback type that ensures compatibility between Map and panzoom
 */
export type PanzoomCallbackAdapter = (e: EnhancedPanzoomEvent) => void;

/**
 * Utility function to adapt a Map callback to be compatible with panzoom
 * @param callback Function that expects an enhanced event with non-optional isRight
 * @returns A function compatible with the panzoom library
 */
export function createPanzoomAdapter(
  callback: PanzoomCallbackAdapter
): PanzoomCallback {
  return (e: PanzoomEvent) => {
    // Ensure isRight is always a boolean (false if undefined)
    const enhancedEvent: EnhancedPanzoomEvent = {
      ...e,
      isRight: e.isRight === true
    };
    callback(enhancedEvent);
  };
}
