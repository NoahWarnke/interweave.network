import Web3Handler from '../js/Web3Handler.js';
import InterweaveFreeHandler from '../js/InterweaveFreeHandler.js';

import TheNavbar from './TheNavbar.js';
import TheRenderArea from './TheRenderArea.js';
import ModalInfo from './ModalInfo.js';

export default {
  name: 'App',
  template: `
    <div id="app">
      <the-navbar v-bind:node="currentNode"></the-navbar>
      <the-render-area v-bind:node="currentNode"></the-render-area>
      <modal-info v-if="false"></modal-info>
    </div>
  `,
  components: {
    TheNavbar,
    TheRenderArea,
    ModalInfo
  },
  data: function() {
    return {
      web3Handler: undefined,
      contract: undefined,
      currentNode: {}
    }
  },
  methods: {
    init: async function() {
      try {
        this.web3Handler = new Web3Handler();
        await this.web3Handler.initialize();
        
        this.contract = new InterweaveFreeHandler();
        await this.contract.initialize(this.web3Handler);
        
        // Grab starting node data.
        this.updateNode("6425788636526616286741869931615606349765969179734729515957019907323234972557");
      }
      catch (error) {
        console.log(error);
      }
    },
    updateNode: async function(nodeKey) {
      try {
        this.currentNode = await this.contract.getNode(nodeKey);
        this.currentNode.edgeNodeKeys = [1, 2, 3, 0, 0, 0]; // TODO remove
      }
      catch (error) {
        console.log(error);
      }
    }
  },
  created: function() {
    this.init();
  }
};
