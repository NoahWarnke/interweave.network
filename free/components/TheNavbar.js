import ButtonHome from "./ButtonHome.js";
import ButtonEdge from "./ButtonEdge.js";

export default {
  template: `
    <div id="navbar">
      <button-home></button-home>
      <button-edge
        v-for="edge in availableEdges" :key="edge.nodeKey"
        v-bind:edge="edge"
        v-on:edgeClick="edgeClick">
      </button-edge>
      <button id="button-build" class="navbar-button" v-on:click="buildClick()">
        {{buildButtonLabel}}
      </button>
      <button id="button-my-nodes" class="navbar-button" v-if="showBuildTools" v-on:click="myNodesClick()">My Nodes</button>
    </div>
  `,
  components: {
    ButtonHome,
    ButtonEdge
  },
  props: {
    currentNodeKey: String,
    nodes: Object,
    showBuildTools: Boolean,
    currentView: String,
    account: String
  },
  computed: {
    availableEdges: function() {
      let result = {};
      if (this.currentNodeKey === undefined) {
        return [];
      }
      let currentNode = this.nodes[this.currentNodeKey];
      if (currentNode === undefined) {
        return [];
      }
      let edgeNodeKeys = currentNode.edgeNodeKeys;
      if (edgeNodeKeys !== undefined) {
        
        return edgeNodeKeys
          .map((value, index) => {
            return {
              slot: index,
              nodeKey: value
            };
          })
          .filter((value) => {return value.nodeKey != 0;})
        ;
      }
      return [];
    },
    buildButtonLabel: function() {
      if (!this.account) {
        return "Unlock";
      }
      if (this.showBuildTools) {
        return "Hide tools"
      }
      
      return "Build tools"
    }
  },
  methods: {
    edgeClick: function($event) {
      this.$emit("edgeClick", $event); // Pass it up the chain.
    },
    buildClick: function() {
      this.$emit("buildClick");
    },
    myNodesClick: function() {
      this.$emit("myNodesClick");
    }
  }
}
