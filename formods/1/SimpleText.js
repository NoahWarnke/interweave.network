import Explore from './SimpleTextExplore.js';
import Build from './SimpleTextBuild.js';
import SimpleTextUtils from "./SimpleTextUtils.js";

/** A Class for a format module whose instances contain:
 * - an explore component instantiator
 * - a view component instantiator
 * - a method of validating data in this format.
 */
export default class SimpleText {
  
  /** Construct an instance of this format module. */
  constructor() {
    
    // Extend the classes with Vue, so they are ready to be instantiated as Vue components.
    this.explore = Vue.extend(Explore);
    this.build = Vue.extend(Build);
  }
  
  /** Return this instance's explore component instantiator. */
  exploreClass() {
    return this.explore;
  }
  
  /** Return this instance's build component instnatiator. */
  buildClass() {
    return this.build;
  }
  
  /** Validate parsed data for this format module. Throws if there is an error, does nothing otherwise. */
  validateParsedData(data) {
    SimpleTextUtils.validateParsedData(data);
  }
}
