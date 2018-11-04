
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
    node: Object,
    parsedNodeData: Object,
    edgeStart: false,
    edgeBoundary: false
  },
  data: function() {
    return {
      consoleText: this.parsedNodeData.shortDesc,
      consoleInput: ""
    }
  },
  methods: {
    consoleInputEntered: async function() {
      
      if (this.edgeStart) {
        if (!this.edgeBoundary) {
          // TODO fire edgeBoundary event.
          this.edgeBoundary = true;
        }
        this.consoleInput = "";
        return;
      }
      
      let entered = this.consoleInput;
      
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
      this.consoleText += "\n" + str;
      
      // Scroll console to bottom (after waiting a tick for the console to populate with new lines.)
      await Vue.nextTick();
      this.$refs.console.scrollTop = this.$refs.console.scrollHeight;
    },
    parseCommand: function(cmd) {
      //let words = cmd.split(" ");
      
      // Greedily look for matches.
      
      // Check for edges.
      for (var edgeKey in this.parsedNodeData.edges) {
        let edge = this.parsedNodeData.edges[edgeKey];
        
        for (var edgeVerbKey in edge.verbs) {
          let edgeVerb = edge.verbs[edgeVerbKey];
          if (cmd.indexOf(edgeVerb) === 0) {
            for (var edgeNameKey in edge.names) {
              let edgeName = edge.names[edgeNameKey];
              if (cmd.indexOf(edgeName) === edgeVerb.length + 1) {
                console.log("Edge!");
                // Houston, we've had an edge!
                this.addToConsole(edge.leaveDesc + " [enter anything to continue]");
                // TODO emit edgeStart event with edgeKey included (and maybe console content?)
                this.edgeStart = true;
                return;
              }
            }
          }
        }
      }
      
      // Check for other actions.
      let actionKeys = Object
        .keys(this.parsedNodeData)
        .filter((key) => {
          return ["format", "name", "shortDesc", "edges"].indexOf(key) === -1;
        })
      ;
      
      for (var actionKeyKey in actionKeys) {
        let actionKey = actionKeys[actionKeyKey];
        
        if (cmd.indexOf(actionKey) === 0) {
          let actionTargets = this.parsedNodeData[actionKey];
          
          for (var actionTargetKey in actionTargets) {
            let actionTarget = actionTargets[actionTargetKey];
            
            for (var actionNameKey in actionTarget.names) {
              let actionName = actionTarget.names[actionNameKey];
              if ((actionName === "" && cmd.trim() === actionKey) || cmd.indexOf(actionName) === actionKey.length + 1) {
                // Houston, we've had an action!
                this.addToConsole(actionTarget.desc);
                return;
              }
            }
          }
        }
      }
      
      // No matches.
      this.addToConsole("You're unable to do this.");
    }
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
