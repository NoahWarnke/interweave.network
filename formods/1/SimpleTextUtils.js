
export default {
  verbs: {
    "0": ["examine", "look", "look at", "inspect", "investigate", "check out"],
    "1": ["listen", "listen to"],
    "2": ["smell", "sniff", "sniff at"],
    "3": ["taste", "lick"],
    "4": ["touch", "feel"],
    "5": ["go", "go to", "travel", "travel to", "explore"],
    "6": ["go into", "enter"],
    "7": ["go onto", "climb onto"],
    "8": ["follow", "walk along", "walk down"],
    "9": ["swim", "swim across", "swim into", "swim in", "wade", "wade across", "wade into"],
    "10": ["climb", "climb up", "climb over"]
  },
  verbFailNoTarget: {
    "0": "You can't see anything like that here.",
    "1": "You don't hear anything like that here.",
    "2": "There isn't anything like that here to smell.",
    "3": "There isn't anything like that here to taste.",
    "4": "There isn't anything like that here to touch.",
    "5": "There isn't anywhere like that here that you could go.",
    "6": "There isn't anything like that here that you could go into.",
    "7": "There isn't anything like that here that you could go onto.",
    "8": "There isn't anything like that here that you could follow.",
    "9": "You don't see anything like that here that you could swim into.",
    "10": "You don't see anything like that here that you could climb."
  },
  verbFailTarget: {
    "0": "You can't make out any more detail.",
    "1": "There is nothing more to be heard.",
    "2": "You can't smell that.",
    "3": "You mustn't lick that!",
    "4": "That seems impractical or uninformative.",
    "5": "You can't go there.",
    "6": "You can't enter that.",
    "7": "You can't get onto that.",
    "8": "You can't follow that.",
    "9": "That is not somewhere you could swim!",
    "10": "You can't climb that!"
  }
  
  /*,
  validateParsedData: function(data) {
    
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
      
      if (result.indexOf("edge") === 0) {
        let slot = parseInt(result.substr(4, result.length - 4));
        if (data.edges[slot] === undefined) {
          throw new Error("SimpleText result was an edge type, but did not refer to a valid edge (result " + result + ")");
        }
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
        let result = data.results[resultKey];
        if (result === undefined) {
          throw new Error("SimpleText binding result keys must refer to results in the results object (result " + resultKey + " for target " + targetKey + " for verb " + verbKey + ")")
        }
      }
    }
    
    // Yay, no errors!
  }
  */
}
