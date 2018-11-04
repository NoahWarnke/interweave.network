
// Format modules
import SimpleText from '../../formods/1/SimpleText.js';



export default {
  template: `
    <div id="render">
      <div v-if="nodeDataError !== undefined">{{nodeDataError}}</div>
      <div ref="formodexploreslot"></div>
      <!--
      <div id="norender-info" v-if="node.ipfs !== undefined">
        <div class="node-key-and-ipfs">
          <p>Current node key: {{node.key}}</p>
          <p>Current node IPFS: <a target="_blank" v-bind:href="'https://ipfs.io/ipfs/' + node.ipfs">{{node.ipfs}}</a></p>
        </div>
        <textarea class="node-file-text" readonly="readonly">{{node.data || "Loading..."}}</textarea>
      </div>
      -->
    </div>
  `,
  props: {
    node: Object
  },
  data: function() {
    return {
      formats: {
        1: new SimpleText()
      },
      parsedNodeData: undefined,
      nodeDataParsedSuccessfully: false,
      nodeDataLoadedSuccessfully: false,
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
      this.nodeDataRenderable = false;
      this.nodeDataError = undefined;
      this.nodeRenderer = undefined;
      
      // Clear the formod explore slot component, if any exist.
      let exploreEl = this.$refs.formodexploreslot;
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
      if (this.formats[this.parsedNodeData.format] === undefined) {
        this.nodeDataError = "Format " + this.parsedNodeData.format + " is not supported.";
        return;
      }
      this.nodeDataRenderable = true;
      
      // Now let's set up our renderer component.
      // Since we're programmatically picking a component from a potentially very long list of supported formats,
      // we need to set it up this way, rather than having all those elements in the template with a ton of v-ifs on them to pick just one.
      
      // Instantiate our renderer component and pass it some props.
      this.nodeRenderer = new (this.formats[this.parsedNodeData.format].exploreClass())({
        propsData: {
          node: this.node,
          parsedNodeData: this.parsedNodeData
        }
      });
      // Mount it, passing no element (makes it as an off-document element).
      this.nodeRenderer.$mount();
      
      // Finally, add it to the formod explore slot element.
      exploreEl.appendChild(this.nodeRenderer.$el);
    }
  },
  watch: {
    node: {
      immediate: true,
      deep: true,
      handler(val, oldVal) {
        if (val !== undefined && val.data !== undefined) {
          this.parseNodeData(val.data);
        }
      }
    }
  }
}
