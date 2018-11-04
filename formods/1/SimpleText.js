import Explore from './SimpleTextExplore.js';
import Build from './SimpleTextBuild.js';


export default class SimpleText {
  
  constructor() {
    
    // Extend the classes with Vue, so they are ready to be instantiated as Vue components.
    this.explore = Vue.extend(Explore);
    this.build = Vue.extend(Build);
  }
  
  exploreClass() {
    return this.explore;
  }
  
  buildClass() {
    return this.build;
  }
  /*
  registerEdgeStart(callback) {
    
  }
  
  registerEdgeBoundary(callback) {
    
  }
  
  registerBuildFinalization(callback) {
    
  }
  */
}
