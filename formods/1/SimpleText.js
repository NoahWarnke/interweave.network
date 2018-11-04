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
      if (edge.names === undefined || edge.names.constructor !== Array || edge.names.length === 0) {
        throw new Error("SimpleText edges must each have a name array that has more than 0 elements (edge #" + edgeKey + ")");
      }
      for (var nameKey in edge.names) {
        let name = edge.names[nameKey];
        if (typeof name !== "string" || name.length === 0) {
          throw new Error("SimpleText edge names must each be a non-empty string (name #" + nameKey + " of edge #" + edgeKey + ")");
        }
      }
      if (edge.verbs === undefined || edge.verbs.constructor !== Array || edge.verbs.length === 0) {
        throw new Error("SimpleText edges must each have a verbs array that has more than 0 elements (edge #" + edgeKey + ")");
      }
      for (var verbKey in edge.verbs) {
        let verb = edge.verbs[verbKey];
        if (typeof verb !== "string" || verb.length === 0) {
          throw new Error("SimpleText edge verbs must each be a non-empty string (verb #" + verbKey + " of edge #" + edgeKey + ")");
        }
      }
    }
    
    // Other actions (examine, listen, etc.)
    let actionKeys = Object
      .keys(data)
      .filter((key) => {
        return ["format", "name", "shortDesc", "edges"].indexOf(key) === -1;
      })
    ;
    
    for (var actionKeyKey in actionKeys) {
      let actionKey = actionKeys[actionKeyKey];
      let action = data[actionKey];
      
      if (action === undefined || action.constructor !== Array || action.length === 0) {
        throw new Error("SimpleText actions must each be an array that has more than 0 elements (action " + actionKey + ")");
      }
      
      let actionMatches = {};
      for (var actionMatchKey in action) {
        let actionMatch = action[actionMatchKey];
        if (actionMatch.names === undefined || actionMatch.names.constructor !== Array || actionMatch.names.length === 0) {
          throw new Error("SimpleText action matches must each have a name array that has more than 0 elements (action match #" + actionMatchKey + " of action " + actionKey + ")");
        }
        for (var nameKey in actionMatch.names) {
          let name = actionMatch.names[nameKey];
          if (typeof name !== "string") { // numEmpty increasese each time there's a length === 0 name.
            throw new Error("SimpleText action match names must each be a string (name #" + nameKey + " of action match #" + actionMatchKey + " of action " + actionKey + ")");
          }
          if (actionMatches[name] !== undefined) {
            throw new Error("SimpleText action match names must each be a unique for that action (name " + name + " of action match #" + actionMatchKey + " of action " + actionKey + ")");
          }
        }
        
        if (typeof actionMatch.desc !== "string" || actionMatch.desc.length === 0) {
          throw new Error("SimpleText actions must each contain a desc property (a short description of the what happens when the action matches) that is a non-empty string (action match " + actionMatchKey + " of action " + actionKey + ")");
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
