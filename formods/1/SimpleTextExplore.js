
export default {
  template: `
    <div id="simple-text-explore">
      <h1>> {{parsedNodeData.name}} <</h1>
      <textarea class="console" readonly="readonly">{{consoleText}}</textarea>
    </div>
  `,
  props: {
    node: Object,
    parsedNodeData: Object
  },
  data: function() {
    return {
      consoleText: this.parsedNodeData.shortDesc || "muffin"
    }
  },
  computed: {
    /*
    let verbs = Object
      .keys(this.parsedNodeData)
      .filter((key) => {
        return ["format", "name", "shortDesc", "edges"].indexOf(key) === -1;
      })
    ;
    
    let tree = verbs.map((key) => {
      return {
        
      }
    })
    */
  }
}
