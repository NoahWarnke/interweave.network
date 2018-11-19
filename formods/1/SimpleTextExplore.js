import SimpleTextUtils from "./SimpleTextUtils.js";

export default {
  template: `
    <div id="simple-text-explore">
      <h1>{{currentNodeIpfsData.name}}</h1>
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
    arrivedSlot: Number,
    currentNodeEdgeNodeKeys: Array,
    currentNodeIpfsData: Object
  },
  data: function() {
    return {
      verbToKey: {}, // created from verbs list.
      verbFailNoTarget: SimpleTextUtils.verbFailNoTarget,
      verbFailTarget: SimpleTextUtils.verbFailTarget,
      consoleText:"",
      consoleInput: "",
      edgeStart: false
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
    init: function() {
      
      // Invert our verbs and targets arrays for faster lookup.
      this.verbToKey = this.invertLookup(SimpleTextUtils.verbs);

    },
    newNodeData: async function(arrivedSlot) {
      this.currentNodeIpfsData.targetToKey = this.invertLookup(this.currentNodeIpfsData.targets);
      let edge = this.currentNodeIpfsData.edges[arrivedSlot + ""];
      if (edge !== undefined) {
        await this.addToConsole(edge.enterDesc + "\n");
      }
      this.addToConsole("_____ " + this.currentNodeIpfsData.name + " _____\n" + this.currentNodeIpfsData.shortDesc);
    },
    consoleInputEntered: async function() {
      console.log("consoleInputEntered!");
      if (this.edgeStart) {
        this.edgeStart = false;
        this.consoleInput = "";
        this.$emit("edgeBoundary");
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
      console.log("parseCommand!");
      
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
          targetKey = this.currentNodeIpfsData.targetToKey[""];
        }
        else {
          for (var t = words.length - v; t > 0; t--) {
            let lastTWords = words
              .slice(v, v + t)
              .join(" ")
              .toLowerCase()
            ;
            
            targetKey = this.currentNodeIpfsData.targetToKey[lastTWords];
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
        let bindingVerb = this.currentNodeIpfsData.bindings[verbKey];
        if (bindingVerb === undefined) {
          continue;
        }
        
        let resultId = bindingVerb[targetKey];
        if (resultId === undefined) {
          continue;
        }
        
        let result = this.currentNodeIpfsData.results[resultId];
          
        if (result.indexOf("edge") === 0) {
          let slot = parseInt(result.substr(4, result.length - 4));
          let edge = this.currentNodeIpfsData.edges[slot];
          
          if (edge !== undefined) {
            
            let nodeKey = this.currentNodeEdgeNodeKeys[slot];
            // Not-yet-connected edge, so turn around.
            if (nodeKey == 0) {
              this.addToConsole(edge.leaveDesc + "\n\nHowever, you cannot go any further, and turn around.\n");
              this.newNodeData(slot); 
              return;
            }
            
            // Houston, we've had an edge!
            this.addToConsole(edge.leaveDesc + " [Press enter to continue]\n");
            
            this.$emit("edgeStart", {
              slot: slot,
              nodeKey: nodeKey,
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
  watch: {
    currentNodeIpfsData: {
      immediate: true,
      deep: true,
      handler: function(val, oldVal) {
        if (val !== oldVal) {
          this.newNodeData(this.arrivedSlot);
        }
      }
    }
  }
}
