
export default {
  template: `
    <div id="render">
      <div id="norender-info" v-if="nodeRenderer === undefined">
        <div class="error" v-if="nodeDataError !== undefined">
          {{nodeDataError}}
        </div>
        <div class="node-key-and-ipfs">
          <p>Node key: {{currentNodeKey}}</p>
          <p v-if="currentNode !== undefined">
            Node IPFS: <a target="_blank" v-bind:href="'https://ipfs.io/ipfs/' + currentNode.ipfs">{{currentNode.ipfs}}</a>
          </p>
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
      currentValidatedNodeKey: undefined,
      currentValidatedNodeIpfsData: undefined,
      nodeDataLoadedSuccessfully: false,
      nodeDataFormatAvailable: false,
      nodeDataRenderable: false,
      nodeDataError: undefined,
      arrivedSlot: undefined,
      currentFormod: undefined,
      nodeRenderer: undefined
    }
  },
  computed: {
    currentNode: function() {
      return this.nodes[this.currentNodeKey];
    },
    currentNodeEdgeNodeKeys: function() {
      return this.currentNode.edgeNodeKeys;
    },
    currentNodeIpfsData: function() {
      return this.ipfsData[this.currentNodeKey];
    }
  },
  methods: {
    /**
     * Possibly parse some new Node data and update our renderer, if it's actually a new Node.
     */
    maybeUpdate: function() {
      
      // Get the formod explore slot component
      let exploreEl = this.$refs.formodexploreslot;
      
      // If this happened to get called before the component is done loading, just return. Will be called again on mounted().
      if (exploreEl === undefined) {
        return;
      }
      
      // Don't do anything if we are already ran validation on this Node's data.
      if (this.currentNodeKey === this.currentValidatedNodeKey && this.currentNodeIpfsData === this.currentValidatedNodeIpfsData) {
        return;
      }
      
      // Do all of our validation checks on the new data.
      this.validateNodeData(this.currentNodeIpfsData);
      
      // If there was an error, remove our render slot.
      // If there was no error and the previous Node's format is the same as the current one, keep the render slot and just update its contents.
      // If there was no error and the previous Node's format is different from the current one, swap out the render slot.
      
      let previousNodeFormod = undefined;
      if (this.previousNodeKey !== undefined) {
        let previousNodeIpfs = this.ipfsData[this.previousNodeKey];
        if (previousNodeIpfs !== undefined) {
          previousNodeFormod = this.formats[previousNodeIpfs.format];
        }
      }
      
      // Keep renderer if no validation errors and the previous Node's format is the same as the current one.
      if (this.nodeDataError === undefined && previousNodeFormod === this.currentFormod) {
        console.log("New Node, same format, no error!");
        
        // Have to explicitly update the nodeRenderer's props, since it's not actually bound.
        this.nodeRenderer._props.currentNodeEdgeNodeKeys = this.currentNodeEdgeNodeKeys;
        this.nodeRenderer._props.currentNodeIpfsData = this.currentNodeIpfsData;
        this.nodeRenderer._props.arrivedSlot = this.arrivedSlot;
        return;
      }
      
      // Clear the formod explore slot, if anything's there.
      this.nodeRenderer = undefined;
      while (exploreEl.firstChild) {
        exploreEl.removeChild(exploreEl.firstChild);
      }
      
      // If there was an error, we're done.
      if (this.nodeDataError !== undefined) {
        return;
      }
      
      // Now let's set up our renderer component.
      // Since we're programmatically picking a component from a potentially very long list of supported formats,
      // we need to set it up this way, rather than having all those elements in the template with a ton of v-ifs on them to pick just one.
      
      // Instantiate our renderer component and pass it some props.
      this.nodeRenderer = new (this.currentFormod.exploreClass())({
        propsData: {
          currentNodeEdgeNodeKeys: this.currentNodeEdgeNodeKeys,
          currentNodeIpfsData: this.currentNodeIpfsData,
          arrivedSlot: this.arrivedSlot
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
    validateNodeData: function(currentNodeIpfsData) {
      
      // Reset everything.
      this.nodeDataLoadedSuccessfully = false;
      this.nodeDataFormatAvailable = false;
      this.nodeDataRenderable = false;
      this.nodeDataError = undefined;
      
      // Keep track that we've run a validation on this Node key and IPFS data.
      this.currentValidatedNodeKey = this.currentNodeKey;
      this.currentValidatedNodeIpfsData = this.currentNodeIpfsData;
      
      if (this.currentNode === undefined) {
        this.nodeDataError = "No loaded Node!";
        return;
      }
      
      if (this.currentNodeIpfsData === undefined) {
        this.nodeDataError = "No loaded Node IPFS data!";
        return;
      }
      
      // Confirm no load errors.
      if (this.currentNodeIpfsData.status === "failed") {
        this.nodeDataError = this.currentNodeIpfsData.error;
        return;
      }
      this.nodeDataLoadedSuccessfully = true;
      
      // Check if we have an available format.
      if (this.currentNodeIpfsData.format === undefined) {
        this.nodeDataError = "JSON was missing a format value.";
        return;
      }
      this.currentFormod = this.formats[this.currentNodeIpfsData.format];
      if (this.currentFormod === undefined) {
        this.nodeDataError = "Format " + this.currentNodeIpfsData.format + " is not supported.";
        return;
      }
      
      // Validate the data via its format module validator:
      try {
        this.currentFormod.validateParsedData(this.currentNodeIpfsData);
      }
      catch (error) {
        this.nodeDataError = error.message;
        return;
      }
      this.nodeDataRenderable = true;
      
      // Figure out which slot we arrived from.
      // If there was no previous Node key, or if it's not among the current Node's edges, set to -1.
      this.arrivedSlot = -1;
      for (var keyKey in this.currentNode.edgeNodeKeys) {
        if (this.currentNode.edgeNodeKeys[keyKey] === this.previousNodeKey) {
          this.arrivedSlot = parseInt(keyKey);
        }
      }
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
          this.maybeUpdate();
        }
      }
    },
    nodes: {
      immediate: true,
      deep: true,
      handler: function(val, oldVal) {
        if (val[this.currentNodeKey] !== undefined && this.ipfsData[this.currentNodeKey] !== undefined) {
          this.maybeUpdate();
        }
      }
    },
    ipfsData: {
      immediate: true,
      deep: true,
      handler: function(val, oldVal) {
        if (this.nodes[this.currentNodeKey] !== undefined && val[this.currentNodeKey] !== undefined) {
          this.maybeUpdate();
        }
      }
    }
  },
  mounted: function() {
    if (this.nodes[this.currentNodeKey] !== undefined && this.ipfsData[this.currentNodeKey] !== undefined) {
      this.maybeUpdate();
    }
  }
}
