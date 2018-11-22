
export default {
  template: `
    <div id="build">
      <h1>Create your node here! :D</h1>
      <select v-model="currentFormod">
        <option disabled value="undefined">Select a format module for your new node!</option>
        <option
          v-for="(formod, formodName) in formodsByName"
          v-bind:value="formod">
          {{formodName}}
        </option>
      </select>
      <div ref="formodbuildslot"></div>
    </div>
  `,
  props: {
    formats: Object
  },
  data: function() {
    return {
      currentFormod: undefined,
      buildRenderer: undefined
    }
  },
  computed: {
    formodsByName: function() {
      if (this.formats === undefined) {
        return [];
      }
      let result = {};
      for (var key in this.formats) {
        result["[" + key + "] " + this.formats[key].name()] = this.formats[key];
      }
      return result;
    }
  },
  methods: {
    clearBuildSlot: function() {
      let buildEl = this.$refs.formodbuildslot;
      this.buildRenderer = undefined;
      while (buildEl.firstChild) {
        buildEl.removeChild(buildEl.firstChild);
      }
    },
    setBuildSlot: function() {
      console.log(this.currentFormod);
      let buildEl = this.$refs.formodbuildslot;
      
      // Instantiate our renderer component and pass it some props.
      this.buildRenderer = new (this.currentFormod.buildClass())({
        propsData: {
          //currentNodeEdgeNodeKeys: this.currentNodeEdgeNodeKeys,
          //currentNodeIpfsData: this.currentNodeIpfsData,
          //arrivedSlot: this.arrivedSlot
        }
      });
      // Mount it, passing no element (makes it as an off-document element).
      this.buildRenderer.$mount();
      
      // Trap edge events coming from it.
      //this.buildRenderer.$on("edgeStart", this.edgeStart);
      //this.buildRenderer.$on("edgeBoundary", this.edgeBoundary);
      
      // Finally, add it to the formod build slot element.
      buildEl.appendChild(this.buildRenderer.$el);
    }
  },
  watch: {
    currentFormod: function(val, oldVal) {
      if (val !== oldVal) {
        if (oldVal !== undefined) {
          this.clearBuildSlot();
        }
        if (val !== undefined) {
          this.setBuildSlot();
        }
      }
    }
  }
}
