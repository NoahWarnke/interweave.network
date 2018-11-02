export default {
  template: `
    <button class="edge-button navbar-button">{{shortEdge}}</button>
  `,
  props: {
    edge: String
  },
  computed: {
    shortEdge: function() {
      return this.edge.substr(0, 3) + "..." + this.edge.substr(this.edge.length - 3);
    }
  }
}
