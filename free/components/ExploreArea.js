
export default {
  template: `
    <div id="explore">
      <div id="norender-info" v-if="nodeRenderer === undefined">
        <div v-bind:class="[nodeDataStatus]" v-if="nodeDataError !== undefined">
          {{nodeDataError}}
        </div>
        <div class="node-key-and-ipfs">
          <p>Node key: {{currentNodeKey}}</p>
          <p v-if="currentNodeBStatus === 'successful'">
            Node IPFS: <a target="_blank" v-bind:href="'https://ipfs.io/ipfs/' + currentNode.bData.ipfs">{{currentNode.bData.ipfs}}</a>
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
    nodes: Object
  },
  data: function() {
    return {
      nodeDataError: undefined,
      nodeDataStatus: "good",
      arrivedSlot: undefined,
      currentFormod: undefined,
      nodeRenderer: undefined
    }
  },
  computed: {
    currentNode: function() {
      return this.nodes[this.currentNodeKey];
    },
    currentNodeBStatus: function() {
      if (this.currentNode === undefined) {
        return "none";
      }
      return this.currentNode.bStatus;
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
      
      // Make sure the new node data is all present and accounted for.
      this.checkNodeData();
      
      // If there was an error, remove our render slot.
      // If there was no error and the previous Node's format is the same as the current one, keep the render slot and just update its contents.
      // If there was no error and the previous Node's format is different from the current one, swap out the render slot.
      
      let previousNodeFormod = undefined;
      if (this.previousNodeKey !== undefined) {
        let previousNode = this.nodes[this.previousNodeKey];
        if (previousNode.iStatus === "successful") {
          previousNodeFormod = this.formats[previousNode.format];
        }
      }
      
      // Keep renderer if no validation errors and the previous Node's format is the same as the current one.
      if (this.nodeRenderer !== undefined && this.nodeDataError === undefined && previousNodeFormod === this.currentFormod) {
        
        // Have to explicitly update the nodeRenderer's props, since it's not actually bound.
        this.nodeRenderer._props.currentNode = this.currentNode;
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
          currentNode: this.currentNode,
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
    checkNodeData: function() {
      
      // Reset everything.
      this.nodeDataError = undefined;
      this.nodeDataStatus = undefined;
      
      if (this.currentNode === undefined) {
        this.nodeDataError = "No current node.";
        this.nodeDataStatus === "error";
        return;
      }
      
      if (this.currentNode.bStatus === "init") {
        this.nodeDataError = "Node blockchain data never loaded!";
        this.nodeDataStatus = "error";
        return;
      }
      
      if (this.currentNode.bStatus === "pending") {
        this.nodeDataError = "Loading node blockchain data...";
        this.nodeDataStatus = "warn";
        return;
      }
      
      if (this.currentNode.bStatus === "failed") {
        this.nodeDataError = this.currentNode.bError;
        this.nodeDataStatus = "error";
        return;
      }
      
      if (this.currentNode.iStatus === "init") {
        this.nodeDataError = "Node IPFS data never loaded!";
        this.nodeDataStatus = "error";
        return;
      }
      
      // Confirm loaded and no errors.
      if (this.currentNode.iStatus === "pending") {
        this.nodeDataError = "Loading node IPFS data...";
        this.nodeDataStatus = "warn";
        return;
      }
      
      if (this.currentNode.iStatus === "failed") {
        this.nodeDataError = this.currentNode.iError;
        this.nodeDataStatus = "error";
        return;
      }
      
      this.currentFormod = this.formats[this.currentNode.format];
      if (this.currentFormod === undefined) {
        this.nodeDataError = "Format " + this.currentNode.format + " is not supported.";
        this.nodeDataStatus = "error";
        return;
      }
      
      this.nodeDataStatus = "good";
      
      // Figure out which slot we arrived from.
      // If there was no previous Node key, or if it's not among the current Node's edges, set to -1.
      this.arrivedSlot = -1;
      for (var keyKey in this.currentNode.bData.edgeNodeKeys) {
        if (this.currentNode.bData.edgeNodeKeys[keyKey] === this.previousNodeKey) {
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
        //if (this.nodes[val] !== undefined && this.ipfsData[val] !== undefined) {
          this.maybeUpdate();
        //}
      }
    },
    nodes: {
      immediate: true,
      deep: true,
      handler: function(val, oldVal) {
        //if (val[this.currentNodeKey] !== undefined && this.ipfsData[this.currentNodeKey] !== undefined) {
          this.maybeUpdate();
        //}
      }
    }
  },
  mounted: function() {
    //if (this.nodes[this.currentNodeKey] !== undefined && this.ipfsData[this.currentNodeKey] !== undefined) {
      this.maybeUpdate();
    //}
  }
}
