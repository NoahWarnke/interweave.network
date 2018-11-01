export default {
  template: `
    <div id="render">
      <div id="norender-info" v-if="node.ipfs !== undefined">
        <p>Current node key: {{node.key}}</p>
        <p>Current node IPFS: <a target="_blank" v-bind:href="'https://ipfs.io/ipfs/' + node.ipfs">{{node.ipfs}}</a></p>
      </div>
    </div>
  `,
  props: {
    node: Object
  }
}
