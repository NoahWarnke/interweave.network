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
      <button id="button-my-nodes" class="navbar-button" v-if="buildMode" v-on:click="myNodesClick()">My Nodes</button>
    </div>
  `,
  components: {
    ButtonHome,
    ButtonEdge
  },
  props: {
    node: Object,
    ownedNodes: Array,
    buildMode: Boolean
  },
  computed: {
    availableEdges: function() {
      let result = {};
      if (this.node !== undefined && this.node.edgeNodeKeys !== undefined) {
        
        return this.node.edgeNodeKeys
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
      return this.buildMode ? "Explore" : "Build";
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
