// import { WindowBounds } from "../../types/window-bounds";
// import { WindowState } from "../../types/window-state";

// const DEBUGGING = false;

// // ------------------------------------------------------------------------------------------------------------
// // ------------------------------------------------------------------------------------------------------------
// export const EnsureWindowState = ({
//   isMaximized = false,
//   zoomFactor = 0,
//   zoomLevel = 0,
//   height = 0,
//   width = 0,
//   x = 0,
//   y = 0,
// }: {
//   isMaximized?: boolean;
//   zoomFactor?: number;
//   zoomLevel?: number;
//   height?: number;
//   width?: number;
//   x?: number;
//   y?: number;
// }): WindowState => ({
//   isMaximized: isMaximized ? isMaximized : false,
//   zoomFactor: zoomFactor ? zoomFactor : 1.0,
//   zoomLevel: zoomLevel ? zoomLevel : 1.0,
//   ...EnsureWindowBounds({
//     height,
//     width,
//     x,
//     y,
//   }),
// });

// // ------------------------------------------------------------------------------------------------------------
// // ------------------------------------------------------------------------------------------------------------
// export const EnsureWindowBounds = ({
//   height = 0,
//   width = 0,
//   x = 0,
//   y = 0,
// }: {
//   height?: number;
//   width?: number;
//   x?: number;
//   y?: number;
// }): WindowBounds => ({
//   height: !!height ? Math.floor(height) : 600,
//   width: !!width ? Math.floor(width) : 800,
//   x: !!x ? Math.floor(x) : 512,
//   y: !!y ? Math.floor(y) : 256,
// });

// // ------------------------------------------------------------------------------------------------------------
// // ------------------------------------------------------------------------------------------------------------
// export const EnsureWindowWords = ({
//   appName = "",
//   appInstanceUid = "",
//   appWords = [],
// }: {
//   appName?: string;
//   appInstanceUid?: string;
//   appWords?: string[];
// }): WindowWords => ({
//   appName: appName ? appName : "",
//   appInstanceUid: appInstanceUid ? appInstanceUid : "",
//   appWords: appWords ? appWords : [],
// });

