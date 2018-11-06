
export default {
  template: `
    <div id="simple-text-explore">
      <h1>{{parsedNodeData.name}}</h1>
      <textarea class="console" readonly="readonly" ref="console">{{consoleText}}</textarea>
      <div id="console-input-area">
        <span id="prompt">&gt;</span>
        <input
          id="console-input"
          v-model="consoleInput"
          v-on:keyup.enter="consoleInputEntered">
        </input>
      </div>
    </div>
  `,
  props: {
    arrivedSlot: String,
    node: Object,
    parsedNodeData: Object
  },
  data: function() {
    return {
      verbs: {
        "0": ["examine", "look", "look at", "inspect"],
        "1": ["listen", "listen to"],
        "2": ["smell", "sniff", "sniff at"],
        "3": ["taste", "lick"],
        "4": ["touch", "feel"],
        "5": ["go", "go to", "travel", "travel to"],
        "6": ["go into", "enter"],
        "7": ["go onto", "climb onto"],
        "8": ["follow", "walk along", "walk down"],
        "9": ["swim", "swim across", "swim into", "swim in", "wade", "wade across", "wade into"],
        "10": ["climb", "climb up", "climb onto", "climb over"]
      },
      verbToKey: {}, // created from verbs list.
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
      },
      consoleText:"",
      consoleInput: "",
      edgeStart: false,
      edgeBoundary: false
    }
  },
  methods: {
    invertLookup: function(objectWithArrays) {
      let result = {};
      for (var setKey in objectWithArrays) {
        for (var key in objectWithArrays[setKey]) {
          result[objectWithArrays[setKey][key]] = setKey;
        }
      }
      return result;
    },
    init: async function() {
      
      // Invert our verbs and targets arrays for faster lookup.
      this.verbToKey = this.invertLookup(this.verbs);
      this.parsedNodeData.targetToKey = this.invertLookup(this.parsedNodeData.targets);
      
      let edge = this.parsedNodeData.edges[this.arrivedSlot];
      if (edge !== undefined) {
        await this.addToConsole(edge.enterDesc + "\n");
      }
      this.addToConsole(this.parsedNodeData.shortDesc);
    },
    consoleInputEntered: async function() {
      
      if (this.edgeStart) {
        if (!this.edgeBoundary) {
          // TODO fire edgeBoundary event.
          this.$emit("edgeBoundary");
          this.edgeBoundary = true;
        }
        this.consoleInput = "";
        return;
      }
      
      let entered = this.consoleInput.trim();
      
      // Can't enter empty input.
      if (entered.length === 0) {
        return;
      }
      
      // Clear the input and put it into the console.
      this.consoleInput = "";
      await this.addToConsole("\n> " + entered);
      
      // Do any actions.
      this.parseCommand(entered);
    },
    addToConsole: async function(str) {
      this.consoleText += (this.consoleText.length > 0 ? "\n" : "") + str;
      
      // Scroll console to bottom (after waiting a tick for the console to populate with new lines.)
      await Vue.nextTick();
      this.$refs.console.scrollTop = this.$refs.console.scrollHeight;
    },
    parseCommand: function(cmd) {
      
      let words = cmd.split(" ");
      let mostSpecificVerbKey = undefined;
      let mostSpecificVerbHadMatches = false;
      
      for (var v = words.length; v > 0; v--) {
        let firstVWords = words
          .slice(0, v)
          .join(" ")
          .toLowerCase()
        ;
        
        let verbKey = this.verbToKey[firstVWords];
        if (verbKey === undefined) {
          continue;
        }
          
        // Save the most specific verb in case we find no matches.
        if (mostSpecificVerbKey === undefined) {
          mostSpecificVerbKey = verbKey;
        }
        
        let targetKey = undefined;
        if (v === words.length) {
          // Check for single-verb command string
          targetKey = this.parsedNodeData.targetToKey[""];
        }
        else {
          for (var t = words.length - v; t > 0; t--) {
            let lastTWords = words
              .slice(v, v + t)
              .join(" ")
              .toLowerCase()
            ;
            
            targetKey = this.parsedNodeData.targetToKey[lastTWords];
            if (targetKey !== undefined) {
              break;
            }
          }
        }
        
        if (targetKey === undefined) {
          continue;
        }
        
        if (mostSpecificVerbKey === verbKey) {
          mostSpecificVerbHadMatches = true;
        }
        let bindingVerb = this.parsedNodeData.bindings[verbKey];
        if (bindingVerb === undefined) {
          continue;
        }
        
        let resultId = bindingVerb[targetKey];
        if (resultId === undefined) {
          continue;
        }
        
        let result = this.parsedNodeData.results[resultId];
          
        if (result.indexOf("edge") === 0) {
          let slot = parseInt(result.substr(4, result.length - 4));
          let edge = this.parsedNodeData.edges[slot];
          
          if (edge !== undefined) {
            
            // Not-yet-connected edge, so turn around.
            if (this.node.edgeNodeKeys[slot] == 0) {
              this.addToConsole(
                edge.leaveDesc
                + "\n\nHowever, you cannot go any further, and turn around.\n\n"
                + edge.enterDesc
                + "\n\n"
                + this.parsedNodeData.shortDesc
              );
              return;
            }
            
            // Houston, we've had an edge!
            this.addToConsole(edge.leaveDesc + " [Enter anything to continue]");
            
            this.$emit("edgeStart", {
              slot: slot + "",
              consoleText: this.consoleText // For picking up in the same place later.
            });
            this.edgeStart = true;
            return;
          }
        }
        else {
          this.addToConsole(result);
          return;
        }
      }
      
      // At least one verb matched, but no target/result bindings.
      if (mostSpecificVerbKey !== undefined) {
        if (mostSpecificVerbHadMatches) {
          this.addToConsole(this.verbFailTarget[mostSpecificVerbKey])
        }
        else {
          this.addToConsole(this.verbFailNoTarget[mostSpecificVerbKey]);
        }
        return;
      }
      
      // No matches.
      this.addToConsole("You're unable to do this.");
    }
  },
  created() {
    this.init();
  },
  computed: {
    /*
    let verbs = Object
      .keys(this.parsedNodeData)
      .filter((key) => {
        return ["format", "name", "shortDesc", "edges"].indexOf(key) === -1;
      })
    ;
    
    let tree = verbs.map((key) => {
      return {
        
      }
    })
    */
  }
}
