import Web3Handler from '../js/Web3Handler.js';
import InterweaveFreeHandler from '../js/InterweaveFreeHandler.js';

import TheNavbar from './TheNavbar.js';
import TheRenderArea from './TheRenderArea.js';
import ModalInfo from './ModalInfo.js';

export default {
  name: 'App',
  template: `
    <div id="app">
      <the-navbar v-bind:node="currentNode" v-on:edgeClick="updateNode($event)"></the-navbar>
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
        
        // for console access.
        window.web3Handler = this.web3Handler;
        window.interweave = this.contract;
        
        // Grab starting node data.
        this.updateNode("6425788636526616286741869931615606349765969179734729515957019907323234972557");
      }
      catch (error) {
        console.log(error);
      }
    },
    updateNode: async function(nodeKey) {
      console.log("updateNode");
      try {
        let node = await this.contract.getNode(nodeKey);
        node.data = await this.fetchIpfs(node.ipfs);
        this.currentNode = node;
      }
      catch (error) {
        console.log(error);
      }
    },
    getAjax: function(url) {
      return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function() {
          resolve(xhr.responseText);
        });
        xhr.addEventListener("error", function(err) {
          reject(err);
        });
        xhr.addEventListener("abort", function(err) {
          reject(err);
        });
        xhr.open("GET", url);
        xhr.send();
      });
    },
    fetchIpfs: async function(ipfs) {
      return this.getAjax("https://ipfs.io/ipfs/" + ipfs);
    }
  },
  created: function() {
    this.init();
  }
};
