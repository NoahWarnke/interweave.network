
export default {
  template: `
    <div id="render">
      <div id="norender-info" v-if="nodeRenderer === undefined">
        <div class="error" v-if="nodeDataError !== undefined">
          {{nodeDataError}}
        </div>
        <div class="node-key-and-ipfs">
          <p>Node key: {{currentNodeKey}}</p>
          <p v-if="node !== undefined">Node IPFS: <a target="_blank" v-bind:href="'https://ipfs.io/ipfs/' + node.ipfs">{{node.ipfs}}</a></p>
        </div>
      </div>
      <div
        id="render-component-socket"
        ref="formodexploreslot">
      </div>
    </div>
  `,
  props: {
    formats: Object,
    currentNodeKey: String,
    previousNodeKey: String,
    nextNodeKey: String,
    nodes: Object,
    ipfsData: Object
  },
  data: function() {
    return {
      parsedNodeData: undefined,
      nodeDataParsedSuccessfully: false,
      nodeDataLoadedSuccessfully: false,
      nodeDataFormatAvailable: false,
      nodeDataRenderable: false,
      nodeDataError: undefined,
      nodeRenderer: undefined
    }
  },
  computed: {
    node: function() {
      return this.nodes[this.currentNodeKey];
    },
    nodeIpfsData: function() {
      return this.ipfsData[this.currentNodeKey];
    }
  },
  methods: {
    parseNodeData: function(parsedNodeData) {
      
      // Reset everything.
      this.nodeDataLoadedSuccessfully = false;
      this.nodeDataFormatAvailable = false;
      this.nodeDataRenderable = false;
      this.nodeDataError = undefined;
      
      // Get the formod explore slot component
      let exploreEl = this.$refs.formodexploreslot;
      
      // If this happened to get called before the component is done loading, just return. Will catch on mounted().
      if (exploreEl === undefined) {
        return;
      }
      
      if (this.node === undefined) {
        console.log('No loaded node...');
        return;
        // TODO clear render?
      }
      
      if (this.nodeIpfsData === undefined) {
        console.log('No loaded node ipfs data...');
        return;
      }
      
      this.parsedNodeData = parsedNodeData;
      
      // Clear the formod explore slot, if anything's there.
      this.nodeRenderer = undefined;
      while (exploreEl.firstChild) {
        exploreEl.removeChild(exploreEl.firstChild);
      }
      
      // Confirm no load errors.
      if (this.parsedNodeData.status === "failed") {
        this.nodeDataError = this.parsedNodeData.error;
        return;
      }
      this.nodeDataLoadedSuccessfully = true;
      
      // Check if we have an available format.
      if (this.parsedNodeData.format === undefined) {
        this.nodeDataError = "JSON was missing a format value.";
        return;
      }
      let formod = this.formats[this.parsedNodeData.format];
      if (formod === undefined) {
        this.nodeDataError = "Format " + this.parsedNodeData.format + " is not supported.";
        return;
      }
      
      // Validate the data via its format module validator:
      try {
        formod.validateParsedData(this.parsedNodeData);
      }
      catch (error) {
        this.nodeDataError = error.message;
        return;
      }
      this.nodeDataRenderable = true;
      
      // Figure out which slot we arrived from.
      // If there was no previous Node key, or if it's not among the current Node's edges, set to -1.
      let slot = -1;
      for (var keyKey in this.node.edgeNodeKeys) {
        if (this.node.edgeNodeKeys[keyKey] === this.previousNodeKey) {
          slot = parseInt(keyKey);
        }
      }
      
      // Now let's set up our renderer component.
      // Since we're programmatically picking a component from a potentially very long list of supported formats,
      // we need to set it up this way, rather than having all those elements in the template with a ton of v-ifs on them to pick just one.
      
      // Instantiate our renderer component and pass it some props.
      this.nodeRenderer = new (formod.exploreClass())({
        propsData: {
          node: this.nodes[this.currentNodeKey],
          parsedNodeData: this.parsedNodeData,
          arrivedSlot: slot
        }
      });
      // Mount it, passing no element (makes it as an off-document element).
      this.nodeRenderer.$mount();
      
      // Trap edge events coming from it.
      this.nodeRenderer.$on("edgeStart", this.edgeStart);
      this.nodeRenderer.$on("edgeBoundary", this.edgeBoundary);
      
      // Finally, add it to the formod explore slot element.
      exploreEl.appendChild(this.nodeRenderer.$el);
    },
    edgeStart: function($event) {
      this.$emit("edgeStart", $event);
    },
    edgeBoundary: function() {
      this.$emit("edgeBoundary");
    }
  },
  watch: {
    currentNodeKey: {
      immediate: true,
      handler: function(val, oldVal) {
        if (this.nodes[val] !== undefined && this.ipfsData[val] !== undefined) {
          this.parseNodeData(this.ipfsData[val]);
        }
      }
    },
    nodes: {
      immediate: true,
      deep: true,
      handler: function(val, oldVal) {
        if (val[this.currentNodeKey] !== undefined && this.ipfsData[this.currentNodeKey] !== undefined) {
          this.parseNodeData(this.ipfsData[this.currentNodeKey]);
        }
      }
    },
    ipfsData: {
      immediate: true,
      deep: true,
      handler: function(val, oldVal) {
        if (this.nodes[this.currentNodeKey] !== undefined && val[this.currentNodeKey] !== undefined) {
          this.parseNodeData(val[this.currentNodeKey]);
        }
      }
    }
  },
  mounted: function() {
    if (this.nodes[this.currentNodeKey] !== undefined && this.ipfsData[this.currentNodeKey] !== undefined) {
      this.parseNodeData(this.ipfsData[this.currentNodeKey]);
    }
  }
}
