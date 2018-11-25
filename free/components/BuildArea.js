
export default {
  template: `
    <div id="build">
      <h1>Create your node here! :D</h1>
      <div id="format-and-name" v-if="currentStep === 'formatandname'">
        <table
        <p>
          <span>Node format: </span>
          <select v-model="currentFormod">
            <option disabled value="undefined">Select</option>
            <option
              v-for="(formod, formodName) in formodsByName"
              v-bind:value="formod">
              {{formodName}}
            </option>
          </select>
        </p>
        <p>
          <span v-if="currentVersion !== undefined">Node version: {{currentVersion}}</span>
        </p>
        <p>
          <span>Node name: </span>
          <input v-model="currentName"></input>
        </p>
      </div>
      <div id="format-specific" v-show="currentStep === 'formatspecific'">
        <div ref="formodbuildslot"></div>
      </div>
      <div id="deploy-ipfs" v-if="currentStep === 'deployipfs'">
        Deploy to IPFS!
      </div>
      <div id="deploy-blockchain" v-if="currentStep === 'deployblockchain'">
        Deploy to blockchain!
      </div>
      <div id="next-prev-buttons">
        <button v-if="canClickPrev" v-on:click="clickPrev()">Previous</button>
        <button v-if="canClickNext" v-on:click="clickNext()">Next</button>
      </div>
    </div>
  `,
  props: {
    formats: Object
  },
  data: function() {
    return {
      currentStep: "formatandname",
      currentName: "New Node",
      currentVersion: undefined,
      currentFormod: undefined,
      buildRenderer: undefined,
    }
  },
  computed: {
    formodsByName: function() {
      if (this.formats === undefined) {
        return [];
      }
      let result = {};
      for (var key in this.formats) {
        result[this.formats[key].name()] = this.formats[key];
      }
      return result;
    },
    canClickNext: function() {
      if (this.currentStep === "deployblockchain") {
        return false;
      }
      if (this.currentStep === "formatandname") {
        return (this.currentFormod !== undefined);
      }
      return true;
    },
    canClickPrev: function() {
      if (this.currentStep !== "formatandname") {
        return true;
      }
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
    },
    clickPrev: function() {
      if (!this.canClickPrev) {
        return;
      }
      switch (this.currentStep) {
        case "deployblockchain": {
          this.currentStep = "deployipfs";
          return;
        }
        case "deployipfs": {
          this.currentStep = "formatspecific";
          return;
        }
        case "formatspecific": {
          this.currentStep = "formatandname";
          return;
        }
        default: {
          console.log("BuildArea clickPrev: defaulted! " + this.currentStep);
        }
      }
    },
    clickNext: function() {
      if (!this.canClickNext) {
        return;
      }
      switch (this.currentStep) {
        case "formatandname": {
          this.currentStep = "formatspecific";
          return;
        }
        case "formatspecific": {
          this.currentStep = "deployipfs";
          return;
        }
        case "deployipfs": {
          this.currentStep = "deployblockchain";
          return;
        }
        default: {
          console.log("BuildArea clickNext: defaulted! " + this.currentStep);
        }
      }
    }
  },
  watch: {
    currentFormod: function(val, oldVal) {
      if (val !== oldVal) {
        if (oldVal !== undefined) {
          this.currentVersion = undefined;
          this.clearBuildSlot();
        }
        if (val !== undefined) {
          this.currentVersion = this.currentFormod.latestVersion();
          this.setBuildSlot();
        }
      }
    }
  }
}
