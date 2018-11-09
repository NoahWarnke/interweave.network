export default {
  template: `
    <div id="list-nodes">
      <ul>
        <li v-for="node of pageNodes">
          {{node.data ? node.data.name : node.key}}
        </li>
      </ul>
      <button v-on:click="pageLeft()"><</button>
      <span>{{page}}</span>
      <button v-on:click="pageRight()">></button>
    </div>
  `,
  data: function() {
    return {
      nodesPerPage: 1,
      page: 0
    };
  },
  props: {
    myNodes: Object
  },
  computed: {
    maxPage: function() {
      return Math.max(0, Math.floor((Object.keys(this.myNodes).length - 1) / this.nodesPerPage));
    },
    pageNodes: function() {
      let nodeKeys = Object.keys(this.myNodes);
      
      if (this.page > this.maxPage) {
        this.page = this.maxPage;
      }
      
      let result = [];
      let nodeKeysToGet = [];
      for (var i = 0; i < Math.min(this.nodesPerPage, nodeKeys.length - this.page * this.nodesPerPage); i++) {
        let node = this.myNodes[nodeKeys[i + this.page * this.nodesPerPage]];
        result.push(node);
        
        if (node.data === undefined && !node.pending) {
          nodeKeysToGet.push(nodeKeys[i + this.page * this.nodesPerPage]);
          node.pending = true;
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
    myNodes: {
      immediate: true,
      deep: true,
      handler(val, oldVal) {
        console.log("myNodes update?");
        this.$forceUpdate();
      }
    }
  }
}
