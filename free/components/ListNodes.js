export default {
  template: `
    <div id="list-nodes">
      <ul>
        <li v-for="nodeKey of pageNodeKeys">
          <button v-on:click="viewNode(nodeKey)">View</button>
          <button v-if="nodes[nodeKey].type === 'draft'" v-on:click="editNode(nodeKey)">Edit</button>
          <button v-if="nodes[nodeKey].isOwnedBy(account) || nodes[nodeKey].type === 'draft'" v-on:click="deleteNode(nodeKey)">Delete</button>
          <span v-bind:class="currentNodeKey === nodeKey ? 'current-node' : ''">{{nodeString(nodeKey)}}</span>
          <span v-if="nodes[nodeKey].type === 'draft'">(draft)</span>
        </li>
      </ul>
      <button v-on:click="pageLeft()"><</button>
      <span>{{page+1}}/{{maxPage+1}}</span>
      <button v-on:click="pageRight()">></button>
      <p>
        <button v-on:click="addNode">Add New Node</button>
      </p>
    </div>
  `,
  data: function() {
    return {
      nodesPerPage: 8,
      page: 0,
      pendingNodeData: {}
    };
  },
  props: {
    currentNodeKey: String,
    myNodeKeys: Array,
    myDraftNodeKeys: Array,
    nodes: Object,
    account: String
  },
  computed: {
    maxPage: function() {
      return Math.max(0, Math.floor((this.myNodeKeys.length - 1) / this.nodesPerPage));
    },
    pageNodeKeys: function() {
      if (this.page > this.maxPage) {
        this.page = this.maxPage;
      }
      
      let result = [];
      let nodeKeysToGet = [];
      for (var i = 0; i < Math.min(this.nodesPerPage, this.myNodeKeys.length - this.page * this.nodesPerPage); i++) {
        let nodeKey = this.myNodeKeys[i + this.page * this.nodesPerPage];
        let node = this.nodes[nodeKey];
        result.push(nodeKey);
        
        if (node === undefined || node.iStatus === "init" && !this.pendingNodeData[nodeKey]) {
          nodeKeysToGet.push(nodeKey);
          this.pendingNodeData[nodeKey] = true;
        }
      }
      if (nodeKeysToGet.length > 0) {
        this.$emit("pagedToTheseNodeKeys", nodeKeysToGet);
      }
      return result;
    }
  },
  methods: {
    pageLeft: function() {
      this.page = Math.max(0, this.page - 1);
    },
    pageRight: function() {
      this.page = Math.min(this.maxPage, this.page + 1);
    },
    viewNode: function(nodeKey) {
      this.$emit("myNodesViewClick", nodeKey);
    },
    editNode: function(nodeKey) {
      this.$emit("editNodeClick", nodeKey);
    },
    deleteNode: function(nodeKey) {
      this.$emit("deleteNodeClick", nodeKey);
    },
    addNode: function(nodeKey) {
      this.$emit("addNodeClick");
    },
    nodeString: function(nodeKey) {
      let node = this.nodes[nodeKey];
      
      if (node === undefined || node.bStatus === "init") {
        return nodeKey;
      }
      if (node.bStatus === "pending") {
        return nodeKey + " (blockchain data pending)";
      }
      if (node.bStatus === "failed") {
        return nodeKey + " (" + this.nodes[nodeKey].ebError + ")";
      }
      if (node.iStatus === "init") {
        return node.bData.ipfs;
      }
      if (node.iStatus === "pending") {
        return node.bData.ipfs + " (IPFS data pending)";
      }
      if (node.iStatus === "failed") {
        return node.bData.ipfs + " (" + node.iError + ")";
      }
      return node.name;
    },
    nodeType: function(nodeKey) {
      return this.nodes[nodeKey].type;
    }
  },
  watch: {
    myNodeKeys: {
      immediate: true,
      deep: true,
      handler: function(val, oldVal) {
        this.$forceUpdate();
      }
    },
    nodes: {
      immediate: true,
      deep: true,
      handler: function(val, oldVal) {
        this.$forceUpdate();
      }
    }
  }
}
