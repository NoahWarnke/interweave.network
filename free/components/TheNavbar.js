import ButtonEdge from "./ButtonEdge.js";

export default {
  template: `
    <div id="navbar">
      <a
        role="button"
        id="home"
        class="navbar-button left"
        href="../../">
        Home
      </a>
      <!--
      <button-edge
        v-for="edge in availableEdges" :key="edge.nodeKey"
        v-bind:edge="edge"
        v-on:edgeClick="edgeClick">
      </button-edge>
      -->
      <button
        id="dropdown-edges"
        class="navbar-button left"
        v-if="showBuildTools">
        Edges
      </button>
      <button
        id="button-build"
        class="navbar-button right"
        v-on:click="buildClick()">
        {{buildButtonLabel}}
      </button>
      <button
        id="button-my-edge-proposals"
        class="navbar-button right"
        v-if="showBuildTools"
        v-on:click="myEdgeProposalsClick()">
        My Edge Proposals
      </button>
      <button
        id="button-my-nodes"
        class="navbar-button right"
        v-if="showBuildTools"
        v-on:click="myNodesClick()">
        My Nodes
      </button>
      <button
        id="button-delete-node"
        class="navbar-button right"
        v-if="showBuildTools"
        v-on:click="deleteNodeClick()">
        Delete Node
      </button>
      <button
        id="button-edit-node"
        class="navbar-button right"
        v-if="showBuildTools"
        v-on:click="editNodeClick()">
        Edit Node
      </button>

    </div>
  `,
  components: {
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
      if (currentNode === undefined || currentNode.bStatus !== "successful") {
        return [];
      }
      let edgeNodeKeys = currentNode.bData.edgeNodeKeys;
      if (edgeNodeKeys !== undefined) {
        
        return edgeNodeKeys
          .map((value, index) => {
            return {
              slot: index,
              nodeKey: value
            };
          })
          .filter((value) => {
            return value.nodeKey != 0;
          })
        ;
      }
      return [];
    },
    buildButtonLabel: function() {
      if (!this.account) {
        return "Connect MetaMask";
      }
      if (this.showBuildTools) {
        return "Hide tools"
      }
      return "Show tools"
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
    },
    myEdgeProposalsClick: function() {
      this.$emit("myEdgeProposalsClick");
    },
    editNodeClick: function() {
      console.log(this.currentNodeKey);
      this.$emit("editNodeClick", this.currentNodeKey);
    },
    deleteNodeClick: function() {
      this.$emit("deleteNodeClick");
    }
  }
}
