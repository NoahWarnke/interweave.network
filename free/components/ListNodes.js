export default {
  template: `
    <div id="list-nodes">
      <ul>
        <li v-for="nodeKey of pageNodeKeys">
          {{ipfsData[nodeKey] ? ipfsData[nodeKey].name : (nodes[nodeKey] ? nodes[nodeKey].ipfs : nodeKey)}}
        </li>
      </ul>
      <button v-on:click="pageLeft()"><</button>
      <span>{{page}}/{{maxPage}}</span>
      <button v-on:click="pageRight()">></button>
    </div>
  `,
  data: function() {
    return {
      nodesPerPage: 2,
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
    }
  },
  watch: {
    myNodeKeys: {
      immediate: true,
      deep: true,
      handler: function(val, oldVal) {
        console.log("myNodeKeys update?");
        this.$forceUpdate();
      }
    },
    ipfsData: {
      immediate: true,
      deep: true,
      handler: function(val, oldVal) {
        console.log("ipfsData update?");
        this.$forceUpdate();
      }
    },
    nodes: {
      immediate: true,
      deep: true,
      handler: function(val, oldVal) {
        console.log("nodes update?");
        this.$forceUpdate();
      }
    }
  }
}
