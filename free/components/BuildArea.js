import Node from "../js/Node.js";

export default {
  template: `
    <div id="build">
      <div id="format-and-name" v-if="currentStep === 'formatandname'">
        <h2>Set your Node's name and format</h2>
        <p>
          <span>Node name: </span>
          <input v-model="currentNode.name"></input>
        </p>
        <p>
          <span>Node format: </span>
          <select v-model="currentFormat">
            <option disabled value="undefined">Select</option>
            <option
              v-for="(formod, format) in formats"
              v-bind:value="format">
              {{formod.name()}}
            </option>
          </select>
          <span v-if="currentNode.formatVersion !== undefined">(version {{currentNode.formatVersion}})</span>
        </p>
      </div>
      <div id="format-specific" v-show="currentStep === 'formatspecific'">
        <div ref="formodbuildslot"></div>
      </div>
      <div id="deploy-ipfs" v-if="currentStep === 'deployipfs'">
        
        <h2>Deploy your Node's content to IPFS</h2>
        
        <p>First, make sure your IPFS node is set up (instructions will go here).</p>
        <div v-if="!ipfsNodePresent">
          <p v-if="ipfsNodeError" class="error">{{ipfsNodeError}}</p>
          <button v-on:click="ipfsHandler.update()" class="button">Check again for IPFS node</button>
        </div>
        <div v-if="ipfsNodePresent">
          <p>&#10004; Your IPFS node is all set!</p>
          <p>Now upload your file!</p>
          <button class="button" v-on:click="uploadToIpfs()" v-if="!haveIpfsValue">Add Downloaded File to IPFS</button>
          <p v-if="haveIpfsValue">&#10004; Your Node file is uploaded to IPFS with hash {{currentNode.bData.ipfs}}!</p>
        </div>
          
      </div>
      <div id="deploy-blockchain" v-if="currentStep === 'deployblockchain'">
        <h2>Deploy your Node to the Ethereum blockchain</h2>
        <p>This functionality is not done yet.</p>
        <button>Do it!</button>
      </div>
      <div id="next-prev-buttons">
        <button v-if="canClickPrev" v-on:click="clickPrev()" class="button previous-button">< Previous</button>
        <button v-if="canClickNext" v-on:click="clickNext()" class="button next-button">Next ></button>
      </div>
    </div>
  `,
  props: {
    ipfsHandler: Object,
    ipfsNodePresent: Boolean,
    ipfsNodeError: String,
    formats: Object,
    currentNodeKey: String,
    nodes: Object,
    account: String
  },
  data: function() {
    return {
      currentStep: "formatandname",
      currentFormat: undefined,
      buildRenderer: undefined,
      ipfsInput: ""
    }
  },
  computed: {
    currentNode: function() {
      return this.nodes[this.currentNodeKey];
    },
    nodeExportedJson: function() {
      if (this.currentFormod === undefined) {
        return "Error";
      }
      let contentExport = this.currentFormod.exportContent(
        this.currentNode.formatVersion,
        this.currentNode.iData
      );
      return JSON.stringify({
        name: this.currentNode.name,
        format: this.currentNode.format,
        formatVersion: this.currentNode.formatVersion,
        content: contentExport
      }, null, 2);
    },
    downloadDataUrl: function() {
      return "data:text/plain;charset=utf-8," + encodeURIComponent(this.nodeExportedJson);
    },
    currentFormod: function() {
      return this.formats[this.currentFormat];
    },
    haveIpfsValue: function() {
      return this.currentNode.bStatus === "successful" && this.currentNode.bData.ipfs !== undefined;
    },
    canClickNext: function() {
      if (this.currentStep === "deployblockchain") {
        return false;
      }
      if (this.currentStep === "deployipfs") {
        return this.haveIpfsValue;
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
    init: function() {
      this.currentFormat = this.currentNode.format;
      if (this.currentFormat !== undefined) {
        this.setBuildSlot();
      }
    },
    clearBuildSlot: function() {
      let buildEl = this.$refs.formodbuildslot;
      this.buildRenderer = undefined;
      while (buildEl.firstChild) {
        buildEl.removeChild(buildEl.firstChild);
      }
    },
    setBuildSlot: function() {
      let buildEl = this.$refs.formodbuildslot;
      
      if (buildEl === undefined) {
        return;
      }
      // Instantiate our renderer component and pass it some props.
      this.buildRenderer = new (this.currentFormod.buildClass())({
        propsData: {
          content: this.currentNode.iData
        }
      });
      // Mount it, passing no element (makes it as an off-document element).
      this.buildRenderer.$mount();
      
      // Finally, add it to the formod build slot element.
      buildEl.appendChild(this.buildRenderer.$el);
    },
    removeOldFormod: function() {
      this.clearBuildSlot();
      this.currentNode.format = undefined;
    },
    setNewFormod: function() {
      // Nothing else to do if the current Node already has this new format.
      if (this.currentFormat === this.currentNode.format) {
        return;
      }
      
      this.currentNode.format = this.currentFormat;
      this.currentNode.formatVersion = this.currentFormod.latestVersion();
      
      let content = this.currentFormod.validateAndImportContent(
        this.currentNode.formatVersion,
        this.currentFormod.defaultData()
      );
      this.currentNode.setIPFSState("successful", content, undefined);
      
      this.setBuildSlot();
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
    },
    uploadToIpfs: async function() {
      this.ipfsInput = await this.ipfsHandler.addAndPinFile(this.nodeExportedJson);
    }
  },
  watch: {
    nodes: {
      immediate: true,
      deep: true,
      handler: function(val, oldVal) {
        if (this.buildRenderer !== undefined) {
          this.buildRenderer._props.content = this.nodes[this.currentNodeKey].iData;
        }
      }
    },
    currentFormat: function(val, oldVal) {
      if (val !== oldVal) {
        if (oldVal !== undefined) {
          this.currentNode.formatVersion = undefined;
          this.removeOldFormod();
        }
        if (val !== undefined) {
          this.setNewFormod();
          this.currentNode.formatVersion = this.currentFormod.latestVersion();
        }
      }
    },
    ipfsInput: function(ipfsInput, oldIpfsInput) {
      if (this.currentNode.type === "draft") {
        this.currentNode.bData.ipfs = (ipfsInput !== "" ? ipfsInput : undefined);
      }
    }
  },
  mounted: function() {
    this.init();
  }
}
