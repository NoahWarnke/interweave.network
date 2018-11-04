
export default {
  template: `
    <div id="simple-text-explore">
      <h1>{{parsedNodeData.name}}</h1>
      <p>{{parsedNodeData.shortDesc}}</p>
    </div>
  `,
  props: {
    node: Object,
    parsedNodeData: Object
  }
}
