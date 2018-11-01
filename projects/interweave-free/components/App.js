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
      currentNode: {
        key: "6425788636526616286741869931615606349765969179734729515957019907323234972557",
        ipfs: undefined,
        ownerAddr: undefined,
        edgeNodeKeys: []
      }
    }
  },
  methods: {
    init: async function() {
      this.web3Handler = new Web3Handler();
      await this.web3Handler.initialize();
      
      this.contract = new InterweaveFreeHandler();
      
      try {
        await this.contract.initialize(this.web3Handler);
        
        // Grab node data.
        let nodeData = await this.contract.getNode(this.currentNode.key);
        this.currentNode.owneraddr = nodeData.ownerAddr;
        this.currentNode.ipfs = nodeData.ipfs;
        this.currentNode.edgeNodeKeys = ["0", "1", "2"];//nodeData.edgeNodeKeys;
        
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
