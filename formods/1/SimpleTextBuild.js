
export default {
  template: `
    <h1>Build! Node key: {{node.key}}</h1>
  `,
  props: {
    node: Object,
    parsedNodeData: Object
  }
}
