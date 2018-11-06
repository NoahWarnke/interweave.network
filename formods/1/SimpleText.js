import Explore from './SimpleTextExplore.js';
import Build from './SimpleTextBuild.js';

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
    
    // format
    if (data.format !== 1) {
      throw new Error("SimpleText data must have format 1.");
    }
    
    // version
    if (data.formatVersion !== parseInt(data.formatVersion) || data.formatVersion < 1 || data.formatVersion > 1) {
      throw new Error("SimpleData format version must be an integer 1 >= x >= 1.");
    }
    
    // name
    if (typeof data.name !== "string" || data.name.length === 0) {
      throw new Error("SimpleText data must contain a name property (the not-necessarily-unique name of the Node) that is a non-empty string.");
    }
    
    // shortDesc
    if (typeof data.shortDesc !== "string" || data.shortDesc.length === 0) {
      throw new Error("SimpleText data must contain a shortDesc property (a short description of the Node) that is a non-empty string.");
    }
    
    // edges
    if (data.edges === undefined || data.edges.constructor !== Object || Object.keys(data.edges).length > 6) {
      throw new Error("SimpleText data must contain an edges object that is between 0 and 6 elements long.");
    }
    for (var edgeKey in data.edges) {
      if (edgeKey < 0 || edgeKey > 5) {
        throw new Error("SimpleText edges must have integer indices between 0 and 5 (found " + edgeKey + " )");
      }
      let edge = data.edges[edgeKey];
      if (typeof edge.leaveDesc !== "string" || edge.leaveDesc.length === 0) {
        throw new Error("SimpleText edges must each have a leaveDesc property (a short description of leaving the Node via this edge) that is a non-empty string (edge #" + edgeKey + ")");
      }
      if (typeof edge.enterDesc !== "string" || edge.enterDesc.length === 0) {
        throw new Error("SimpleText edges must each have an enterDesc property (a short description of entering the Node via this edge) that is a non-empty string (edge #" + edgeKey + ")");
      }
    }
    
    // targets
    if (data.targets === undefined || data.targets.constructor !== Object || Object.keys(data.targets).length === 0) {
      throw new Error("SimpleText data must contain a targets object with at least 1 element.");
    }
    let targetMatches = {};
    for (var targetKey in data.targets) {
      let target = data.targets[targetKey];
      if (target.constructor !== Array || target.length === 0) {
        throw new Error("SimpleText targets must be arrays with at least 1 element (target " + targetKey + ")");
      }
      for (var targetItemKey in target) {
        let targetItem = target[targetItemKey];
        if (typeof targetItem !== "string") {
          throw new Error("SimpleText target items must each be a string (target item " + targetItem + " of target " + targetKey + ")");
        }
        if (targetMatches[targetItem] !== undefined) {
          throw new Error("SimpleText target items must each be a unique (target item " + targetItem + " of target " + targetKey + ")");
        }
        targetMatches[targetItem] = true;
      }
    }
    
    // results
    if (data.results === undefined || data.targets.constructor !== Object || Object.keys(data.results).length === 0) {
      throw new Error("SimpleText data must contain a results object with at least 1 element.");
    }
    for (var resultKey in data.results) {
      let result = data.results[resultKey];
      if (typeof result !== "string" || result.length === 0) {
        throw new Error("SimpleText results must be non-empty strings (result " + resultKey + ")");
      }
    }
    
    // bindings
    if (data.bindings === undefined || data.bindings.constructor !== Object || Object.keys(data.bindings).length === 0) {
      throw new Error("SimpleText data must contain a bindings object with at least 1 element.");
    }
    for (var verbKey in data.bindings) {
      if (verbKey != parseInt(verbKey) || verbKey < 0 || verbKey > 10) {
        throw new Error("SimpleText binding verb keys must refer to verbs in the pre-defined verbs object (binding for verb " + verbKey + ")");
      }
      let verb = data.bindings[verbKey];
      if (verb.constructor !== Object || Object.keys(verb).length === 0) {
        throw new Error("SimpleText binding verbs must be objects with at least 1 element (binding for verb " + verbKey + ")");
      }
      for (var targetKey in verb) {
        if (data.targets[targetKey] === undefined) {
          throw new Error("SimpleText binding target keys must refer to targets the targets object (target " + targetKey + " for verb " + verbKey + ")");
        }
        let resultKey = verb[targetKey];
        if (data.results[resultKey] === undefined) {
          throw new Error("SimpleText binding result keys must refer to results in the results object (result " + resultKey + " for target " + targetKey + " for verb " + verbKey + ")")
        }
      }
    }
    
    // Yay, no errors!
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
