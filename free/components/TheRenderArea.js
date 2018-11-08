
export default {
  template: `
    <div id="render">
      <div id="norender-info" v-if="nodeRenderer === undefined">
        <div class="error" v-if="nodeDataError !== undefined">
          {{nodeDataError}}
        </div>
        <div class="node-key-and-ipfs" v-if="node !== undefined">
          <p>Node key: {{node.key}}</p>
          <p>Node IPFS: <a target="_blank" v-bind:href="'https://ipfs.io/ipfs/' + node.ipfs">{{node.ipfs}}</a></p>
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
    node: Object,
    arrivedSlot: Number
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
  methods: {
    parseNodeData: function(data) {
      
      // Reset everything.
      this.parsedNodeData = undefined;
      this.nodeDataParsedSuccessfully = false;
      this.nodeDataLoadedSuccessfully = false;
      this.nodeDataFormatAvailable = false;
      this.nodeDataRenderable = false;
      this.nodeDataError = undefined;
      this.nodeRenderer = undefined;
      
      // Get the formod explore slot component
      let exploreEl = this.$refs.formodexploreslot;
      
      // If this happened to get called before the component is done loading, just return. Will catch on mounted().
      if (exploreEl === undefined) {
        return;
      }
      
      // Clear the formod explore slot, if anything's there.
      while (exploreEl.firstChild) {
        exploreEl.removeChild(exploreEl.firstChild);
      }
      
      // Parse.
      try {
        this.parsedNodeData = JSON.parse(data);
      }
      catch (error) {
        this.nodeDataError = error;
        return;
      }
      this.nodeDataParsedSuccessfully = true;
      
      // Confirm no load errors.
      if (this.parsedNodeData.failed === true) {
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
      
      // Now let's set up our renderer component.
      // Since we're programmatically picking a component from a potentially very long list of supported formats,
      // we need to set it up this way, rather than having all those elements in the template with a ton of v-ifs on them to pick just one.
      
      // Instantiate our renderer component and pass it some props.
      this.nodeRenderer = new (formod.exploreClass())({
        propsData: {
          node: this.node,
          parsedNodeData: this.parsedNodeData,
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
    edgeStart: function($event) {
      this.$emit("edgeStart", $event);
    },
    edgeBoundary: function() {
      this.$emit("edgeBoundary");
    }
  },
  watch: {
    node: {
      immediate: true,
      deep: true,
      handler(val, oldVal) {
        // If the node's data changes and exists, parse it and update errors or the render component if parse is successful.
        if (val !== undefined && val.data !== undefined) {
          this.parseNodeData(val.data);
        }
      }
    }
  },
  mounted: function() {
    if (this.node!== undefined && this.node.data !== undefined) {
      this.parseNodeData(this.node.data);
    }
  }
}
