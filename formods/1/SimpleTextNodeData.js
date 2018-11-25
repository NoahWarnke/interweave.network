

return default class SimpleTextData {
  
  /** Starting from the 'content' variable in an IPFS file, assemble a SimpleTextData object. */
  constructor(content) {
    
    // shortDesc
    if (typeof content.shortDesc !== "string" || content.shortDesc.length === 0) {
      throw new Error("SimpleText content must contain a shortDesc property (a short description of the Node) that is a non-empty string.");
    }
    this.shortDesc = content.shortDesc;
    
    // edges
    if (content.edges === undefined || content.edges.constructor !== Object || Object.keys(content.edges).length > 6) {
      throw new Error("SimpleText content must contain an edges object that is between 0 and 6 elements long.");
    }
    this.edges = {};
    
    for (var edgeKey in content.edges) {
      if (edgeKey < 0 || edgeKey > 5) {
        throw new Error("SimpleText edges must have integer indices between 0 and 5 (found " + edgeKey + " )");
      }
      let edge = content.edges[edgeKey];
      if (typeof edge.leaveDesc !== "string" || edge.leaveDesc.length === 0) {
        throw new Error("SimpleText edges must each have a leaveDesc property (a short description of leaving the Node via this edge) that is a non-empty string (edge #" + edgeKey + ")");
      }
      if (typeof edge.enterDesc !== "string" || edge.enterDesc.length === 0) {
        throw new Error("SimpleText edges must each have an enterDesc property (a short description of entering the Node via this edge) that is a non-empty string (edge #" + edgeKey + ")");
      }
      this.edges[edgeKey] = {
        leaveDesc: edge.leaveDesc,
        enterDesc: edge.enterDesc
      };
    }
    
    // targets
    if (content.targets === undefined || content.targets.constructor !== Object || Object.keys(content.targets).length === 0) {
      throw new Error("SimpleText content must contain a targets object with at least 1 element.");
    }
    this.targets = {};
    
    let targetMatches = {};
    for (var targetKey in content.targets) {
      let target = content.targets[targetKey];
      if (target.constructor !== Array || target.length === 0) {
        throw new Error("SimpleText targets must be arrays with at least 1 element (target " + targetKey + ")");
      }
      this.targets[targetKey] = [];
      
      for (var targetItemKey in target) {
        let targetItem = target[targetItemKey];
        if (typeof targetItem !== "string") {
          throw new Error("SimpleText target items must each be a string (target item " + targetItem + " of target " + targetKey + ")");
        }
        if (targetMatches[targetItem] !== undefined) {
          throw new Error("SimpleText target items must each be a unique (target item " + targetItem + " of target " + targetKey + ")");
        }
        targetMatches[targetItem] = true;
        this.targets[targetKey][targetItemKey] = targetItem;
      }
    }
    
    // results
    if (content.results === undefined || content.targets.constructor !== Object || Object.keys(content.results).length === 0) {
      throw new Error("SimpleText content must contain a results object with at least 1 element.");
    }
    this.results = {};
    
    for (var resultKey in content.results) {
      let result = content.results[resultKey];
      if (typeof result !== "string" || result.length === 0) {
        throw new Error("SimpleText results must be non-empty strings (result " + resultKey + ")");
      }
      
      if (result.indexOf("edge") === 0) {
        let slot = parseInt(result.substr(4, result.length - 4));
        if (content.edges[slot] === undefined) {
          throw new Error("SimpleText result was an edge type, but did not refer to a valid edge (result " + result + ")");
        }
      }
      this.results[resultKey] = result;
    }
    
    // bindings
    if (content.bindings === undefined || content.bindings.constructor !== Object || Object.keys(content.bindings).length === 0) {
      throw new Error("SimpleText content must contain a bindings object with at least 1 element.");
    }
    this.bindings = {};
    
    for (var verbKey in content.bindings) {
      if (verbKey != parseInt(verbKey) || verbKey < 0 || verbKey > 10) {
        throw new Error("SimpleText binding verb keys must refer to verbs in the pre-defined verbs object (binding for verb " + verbKey + ")");
      }
      let verb = content.bindings[verbKey];
      if (verb.constructor !== Object || Object.keys(verb).length === 0) {
        throw new Error("SimpleText binding verbs must be objects with at least 1 element (binding for verb " + verbKey + ")");
      }
      this.bindings[verbKey] = {};
      
      for (var targetKey in verb) {
        if (content.targets[targetKey] === undefined) {
          throw new Error("SimpleText binding target keys must refer to targets the targets object (target " + targetKey + " for verb " + verbKey + ")");
        }
        let resultKey = verb[targetKey];
        let result = content.results[resultKey];
        if (result === undefined) {
          throw new Error("SimpleText binding result keys must refer to results in the results object (result " + resultKey + " for target " + targetKey + " for verb " + verbKey + ")")
        }
        this.bindings[verbKey][targetKey] = resultKey;
      }
    }
    
  }
}
