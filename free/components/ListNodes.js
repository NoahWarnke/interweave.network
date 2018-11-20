export default {
  template: `
    <div id="list-nodes">
      <ul>
        <li
          v-for="nodeKey of pageNodeKeys"
          v-on:click="clickNode(nodeKey)">
          {{nodeString(nodeKey)}}
        </li>
      </ul>
      <button v-on:click="pageLeft()"><</button>
      <span>{{page}}/{{maxPage}}</span>
      <button v-on:click="pageRight()">></button>
    </div>
  `,
  data: function() {
    return {
      nodesPerPage: 1,
      page: 0,
      pendingNodeData: {}
    };
  },
  props: {
    myNodeKeys: Array,
    nodes: Object,
    ipfsData: Object
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
        
        if (this.ipfsData[nodeKey] === undefined && !this.pendingNodeData[nodeKey]) {
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
    clickNode: function(nodeKey) {
      this.$emit("myNodesNodeClick", nodeKey);
    },
    nodeString: function(nodeKey) {
      if (this.nodes[nodeKey] === undefined) {
        return nodeKey;
      }
      if (this.nodes[nodeKey].status === "pending") {
        return nodeKey + " (blockchain data pending)";
      }
      if (this.nodes[nodeKey].status === "failed") {
        return nodeKey + " (blockchain load failed: " + this.nodes[nodeKey].error + ")";
      }
      if (this.ipfsData[nodeKey] === undefined) {
        return this.nodes[nodeKey].ipfs;
      }
      if (this.ipfsData[nodeKey].status === "pending") {
        return this.nodes[nodeKey].ipfs + " (IPFS data pending)";
      }
      if (this.ipfsData[nodeKey].status === "failed") {
        return this.nodes[nodeKey].ipfs + " (IPFS load failed: " + this.ipfsData[nodeKey].error + ")";
      }
      return this.ipfsData[nodeKey].name;
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
    ipfsData: {
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
