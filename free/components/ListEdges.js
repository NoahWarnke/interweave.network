export default {
  template: `
    <div>
      <h2>Edges go here.</h2>
      <ul>
        <li v-for="edgeIdentifier of myEdgeIdentifiers">
          {{edgeIdentifier}}
          <button v-on:click="clickEdge(edgeIdentifier)">Manage Edge</button>
        </li>
      </ul>
      
    </div>
  `,
  props: {
    myEdgeIdentifiers: Array
  },
  methods: {
    clickEdge: function(edgeIdentifier) {
      this.$emit('clickEdge', edgeIdentifier);
    }
  }
}
