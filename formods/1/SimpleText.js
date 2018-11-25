import Explore from './SimpleTextExplore.js';
import Build from './SimpleTextBuild.js';
import SimpleTextNodeData from './SimpleTextNodeData.js';

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
  
  /** Validate and import data for this format module. Throws if there is an error, return an imported object if successful. */
  validateAndImportContent(version, data) {
    
    if (version === 1) {
      return new SimpleTextNodeData(data);
    }
    throw new Error("Invalid SimpleText version number (" + version + ")");
  }
  
  /** Return the name (for the build mode dropdown) of this format module. */
  name() {
    return "SimpleText";
  }
  
  /**
   * @returns the latest version integer for this format module.
   */
  latestVersion() {
    return 1;
  }
}
