export default {
  template: `
    <button class="edge-button navbar-button" v-on:click="click">{{shortEdge}}</button>
  `,
  props: {
    edge: Object // object containing nodeKey and slot
  },
  computed: {
    shortEdge: function() {
      return this.edge.nodeKey.substr(0, 3) + "..." + this.edge.nodeKey.substr(this.edge.nodeKey.length - 3);
    }
  },
  methods: {
    click: function() {
      this.$emit("edgeClick", this.edge);
    }
  }
}
