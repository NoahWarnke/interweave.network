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
      
      <button
        id="button-view-node"
        class="navbar-button left"
        v-bind:class="currentView === 'explore' ? 'active-tab' : ''"
        v-bind:disabled="currentView === 'explore'"
        v-if="showBuildTools"
        v-on:click="viewNodeClick()">
        View Node
      </button>
      
      <button
        id="button-edit-node"
        class="navbar-button left"
        v-bind:class="currentView === 'editnode' ? 'active-tab' : ''"
        v-bind:disabled="currentNode === undefined || currentNode.type !== 'draft' || currentView === 'editnode'"
        v-if="showBuildTools"
        v-on:click="editNodeClick()">
        Edit Node
      </button>
      
      <button
        id="button-my-nodes"
        class="navbar-button left"
        v-bind:class="currentView === 'mynodes' ? 'active-tab' : ''"
        v-bind:disabled="currentView === 'mynodes'"
        v-if="showBuildTools"
        v-on:click="myNodesClick()">
        My Nodes
      </button>
      
      <button
        id="button-my-edge-proposals"
        class="navbar-button left"
        v-bind:class="currentView === 'myedges' ? 'active-tab' : ''"
        v-if="showBuildTools"
        v-bind:disabled="currentView === 'myedges'"
        v-on:click="myEdgeProposalsClick()">
        My Edges
      </button>
      
      <button
        id="button-build"
        class="navbar-button right"
        v-on:click="buildClick()">
        {{buildButtonLabel}}
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
    currentNode: function() {
      return this.nodes[this.currentNodeKey];
    },
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
    viewNodeClick: function() {
      this.$emit("viewNodeClick", this.currentNodeKey);
    },
    editNodeClick: function() {
      this.$emit("editNodeClick", this.currentNodeKey);
    }
  }
}
