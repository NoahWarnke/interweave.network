import ButtonHome from "./ButtonHome.js";
import ButtonEdge from "./ButtonEdge.js";
import ButtonBuild from "./ButtonBuild.js";

export default {
  template: `
    <div id="navbar">
      <button-home></button-home>
      <button-edge
        v-for="edge in availableEdges" :key="edge"
        v-bind:edge="edge"
        v-on:edgeClick="edgeClick">
      </button-edge>
      <button-build></button-build>
    </div>
  `,
  components: {
    ButtonHome,
    ButtonEdge,
    ButtonBuild
  },
  props: {
    node: Object
  },
  computed: {
    availableEdges: function() {
      if (this.node !== undefined && this.node.edgeNodeKeys !== undefined) {
        return this.node.edgeNodeKeys.filter((key) => {
          return key != 0
        });
      }
      return [];
    }
  },
  methods: {
    edgeClick: function($event) {
      this.$emit("edgeClick", $event); // Pass it up the chain.
    }
  }
}
