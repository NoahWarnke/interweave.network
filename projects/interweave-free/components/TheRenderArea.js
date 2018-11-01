export default {
  template: `
    <div id="render">
      <div id="norender-info" v-if="currentNode.ipfs !== undefined">
        <p>Current node key: {{currentNode.key}}</p>
        <p>Current node IPFS: <a target="_blank" v-bind:href="'https://ipfs.io/ipfs/' + currentNode.ipfs">{{currentNode.ipfs}}</a></p>
      </div>
    </div>
  `,
  data: () => {
    return {
      currentNode: {
        key: 123456,
        ipfs: "fakeipfs"
      }
    }
  }
}
