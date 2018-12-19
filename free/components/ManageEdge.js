
export default {
  template: `
    <div>
      <h2>Editing edge {{edgeProposals[currentEdgeIdentifier]}}</h2>
    </div>
  `,
  props: {
    nodes: Object,
    edgeProposals: Object,
    currentEdgeIdentifier: String
  }
}
