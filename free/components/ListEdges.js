export default {
  template: `
    <div>
      <h2>Edges go here.</h2>
      <button v-on:click="clickEdge({test: 'hi'})">Click!</button>
    </div>
  `,
  methods: {
    clickEdge: function(edgeIdentifier) {
      this.$emit('clickEdge', edgeIdentifier);
    }
  }
}
