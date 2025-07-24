declare module '../lib/mix' {
  function mix(baseClass: any): {
    with: (...mixins: any[]) => any;
  };
  export default mix;
}
