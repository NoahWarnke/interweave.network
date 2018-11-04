// Blockchain integration
import Web3Handler from '../js/Web3Handler.js';
import InterweaveFreeHandler from '../js/InterweaveFreeHandler.js';

// Viewer modules
import TheNavbar from './TheNavbar.js';
import TheRenderArea from './TheRenderArea.js';
import ModalInfo from './ModalInfo.js';

// Format modules
import SimpleText from '../../formods/1/SimpleText.js';


export default {
  name: 'App',
  template: `
    <div id="app">
      <the-navbar v-bind:node="currentNode" v-on:edgeClick="updateNode($event)"></the-navbar>
      <the-render-area v-bind:node="currentNode" v-bind:formats="formats"></the-render-area>
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
        key: undefined,
        ownerAddr: undefined,
        ipfs: undefined,
        nodeEdgeKeys: [],
        data: undefined
      },
      formats: {
        1: new SimpleText()
      },
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
      try {
        /*
        let node = await this.contract.getNode(nodeKey);
        node.data = await this.fetchIpfs(node.ipfs);
        this.currentNode = node;
        */
        this.currentNode = await this.contract.getNode(nodeKey);
      }
      catch (error) {
        console.log("blockchain node load failed: " + error);
        // TODO pass error on to user.
        return;
      }
      
      try {
        this.currentNode.data = await this.fetchIpfs(this.currentNode.ipfs);
      }
      catch (error) {
        console.log("Ipfs data load failed: " + error);
        this.currentNode.data = JSON.stringify({
          failed: true,
          error: error
        });
      }
    },
    getAjax: function(url) {
      return new Promise((resolve, reject) => {
        
        // Set up a 30s timeout - IPFS probably doesn't have the data if it takes that long.
        let interval = setInterval(() => {
          xhr.abort();
        }, 30000);
        
        let xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function() {
          if (xhr.status !== 200) {
            cancelInterval(interval);
            reject(url + " replied " + xhr.status);
          }
          resolve(xhr.responseText);
        });
        xhr.addEventListener("error", function(err) {
          cancelInterval(interval);
          reject(err);
        });
        xhr.addEventListener("abort", function(progresEvent) {
          clearInterval(interval);
          reject("30 second timeout was reached.");
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
