import ButtonHome from "./ButtonHome.js";
import ButtonEdge from "./ButtonEdge.js";
import ButtonBuild from "./ButtonBuild.js";

export default {
  template: `
    <div id="navbar">
      <button-home></button-home>
      <div id="edge-buttons">       <!-- <!-- v-if="currentNode.edges !== undefined" -->
        <button-edge></button-edge> <!--  v-for="edge in currentNode.edges" -->
      </div>
      <button-build></button-build>
    </div>
  `,
  components: {
    ButtonHome,
    ButtonEdge,
    ButtonBuild
  }
}
