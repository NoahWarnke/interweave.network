
export default {
  template: `
    <div id="simple-text-explore">
      <h1>{{parsedNodeData.name}}</h1>
      <textarea class="console noselect" readonly="readonly" ref="console">{{consoleText}}</textarea>
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
    parsedNodeData: Object
  },
  data: function() {
    return {
      consoleText: this.parsedNodeData.shortDesc,
      consoleInput: ""
    }
  },
  methods: {
    consoleInputEntered: async function() {
      let entered = this.consoleInput;
      
      if (entered.length === 0) {
        return;
      }
      
      this.consoleInput = "";
      this.addToConsole("> " + entered); // TODO
      
      // Scroll console to bottom.
      await Vue.nextTick();
      this.$refs.console.scrollTop = this.$refs.console.scrollHeight;
    },
    addToConsole: function(str) {
      this.consoleText += "\n" + str;
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
