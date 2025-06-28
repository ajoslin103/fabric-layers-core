// import { nanoid } from 'nanoid';

// import { WindowWords } from '../../types/window-words';

// export function createWindowWords(appName: string, words: string[] = []): WindowWords {
//   return {
//     appName,
//     appInstanceUid: nanoid(),
//     appWords: [...words]
//   };
// }

// export function getAppName(windowWords: WindowWords): string {
//   return windowWords.appName;
// }

// export function getAppInstanceUid(windowWords: WindowWords): string {
//   return windowWords.appInstanceUid;
// }

// export function includes(windowWords: WindowWords, word: string): boolean {
//   return [windowWords.appName, ...windowWords.appWords].includes(word);
// }

// export function toJSON(windowWords: WindowWords): string {
//   return JSON.stringify(windowWords);
// }

// export function fromJSON(json: string): WindowWords {
//   const data = JSON.parse(json);
//   return {
//     appName: data.appName,
//     appInstanceUid: data.appInstanceUid,
//     appWords: data.appWords
//   };
// }
