import ButtonHome from "./ButtonHome.js";
import ButtonEdge from "./ButtonEdge.js";
import ButtonBuild from "./ButtonBuild.js";

export default {
  template: `
    <div id="navbar">
      <button-home></button-home>
      <button-edge v-for="edge in node.edgeNodeKeys" :key="edge" v-bind:edge="edge"></button-edge>
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
  }
}
