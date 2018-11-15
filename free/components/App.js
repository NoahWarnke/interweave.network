// Blockchain integration
import Web3Handler from '../js/Web3Handler.js';
import InterweaveFreeHandler from '../js/InterweaveFreeHandler.js';

// Viewer modules
import TheNavbar from './TheNavbar.js';
import TheRenderArea from './TheRenderArea.js';
import ListNodes from './ListNodes.js';
import ModalInfo from './ModalInfo.js';

// Format modules
import SimpleText from '../../formods/1/SimpleText.js';


export default {
  name: 'App',
  template: `
    <div id="app">
      <the-navbar
        v-bind:currentNodeKey="currentNodeKey"
        v-bind:nodes="nodes"
        v-bind:showBuildTools="showBuildTools"
        v-bind:currentView="currentView"
        v-bind:account="account"
        v-on:buildClick="buildClick()"
        v-on:myNodesClick="myNodesClick()"
        v-on:edgeClick="edgeStart($event); edgeBoundary();">
      </the-navbar>
      <!--
      <the-render-area
        v-bind:currentNodeKey="currentNodeKey"
        v-bind:previousNodeKey="previousNodeKey"
        v-bind:nodes="nodes"
        v-bind:ipfsData="ipfsData"
        v-bind:formats="formats"
        v-on:edgeStart="edgeStart($event)"
        v-on:edgeBoundary="edgeBoundary()"
        v-if="!myNodesMode">
      </the-render-area>
      -->
      <list-nodes
        ref="mynodes"
        v-if="currentView === 'mynodes'"
        v-bind:myNodeKeys="myNodeKeys"
        v-bind:nodes="nodes"
        v-bind:ipfsData="ipfsData"
        v-on:pagedToTheseNodeKeys="pagedToTheseNodeKeys">
      </list-nodes>
      <modal-info v-if="false"></modal-info>
    </div>
  `,
  components: {
    TheNavbar,
    TheRenderArea,
    ListNodes,
    ModalInfo
  },
  data: function() {
    return {
      web3Handler: undefined,
      contract: undefined,
      accountPending: false, // Requested account access, don't have it yet.
      account: undefined,
      formats: {
        1: new SimpleText()
      },
      currentNodeKey: undefined,
      previousNodeKey: undefined,
      myNodeKeys: [],
      nodes: {},
      ipfsData: {},
      
      /*
      currentNode: {
        key: undefined,
        ownerAddr: undefined,
        ipfs: undefined,
        nodeEdgeKeys: [],
        data: undefined
      },
      arrivedSlot: -1,
      pendingNodeKey: undefined,
      myNodes: {},
      */
      showBuildTools: false,
      currentView: "explore"
      
    }
  },
  methods: {
    init: async function() {
      try {
        this.web3Handler = new Web3Handler();
        window.web3Handler = this.web3Handler; // For console access.
        await this.web3Handler.initialize();
        
        this.web3Handler.registerListener("accountChanged", (oldAccount, newAccount) => {
          console.log("Account change handler called!");
          this.account = newAccount;
          
          if (newAccount !== undefined && this.accountPending) {
            console.log('pending unpended');
            this.accountPending = false;
            this.showBuildTools = true;
          }
          this.$forceUpdate(); // external event.
        });
        
        this.contract = new InterweaveFreeHandler();
        window.contract = this.contract; // For console access.
        await this.contract.initialize(this.web3Handler);
        
        // for console access.
        window.web3Handler = this.web3Handler;
        window.interweave = this.contract;
        
        // Grab starting node data.
        this.updateNode("4802423149786398712975601635277375780486398097217997509586637249159306333648");
        this.updateMyNodes();
      }
      catch (error) {
        console.log(error);
      }
    },
    updateNode: async function(nodeKey) {
      let currentNode;
      try {
        this.currentNodeKey = nodeKey;
        currentNode = await this.contract.getNode(nodeKey);
        this.nodes[nodeKey] = currentNode;
        this.pendingEdge = undefined;
      }
      catch (error) {
        console.log("blockchain node load failed: " + error);
        // TODO pass error on to user.
        return;
      }
      
      try {
        this.ipfsData[currentNode.ipfs] = await this.fetchIpfs(currentNode.ipfs);
      }
      catch (error) {
        console.log("Ipfs data load failed: " + error);
        this.ipfsData[currentNode.ipfs] = JSON.stringify({
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
    },
    edgeStart: function($event) {
      if (this.currentNode.edgeNodeKeys[$event.slot] == 0) {
        console.log("Formod attempted to trigger an edge start, but the edge is not set in the blockchain.");
        return;
      }
      this.arrivedSlot = $event.slot;
      this.pendingNodeKey = this.currentNode.edgeNodeKeys[$event.slot]; // $event.nodeKey would work too.
    },
    edgeBoundary: function() {
      this.updateNode(this.pendingNodeKey);
      this.pendingNodeKey = undefined;
    },
    buildClick: function() {
      
      // Trigger web3Handler to try and log in, if not already logged in.
      if (!this.account) {
        this.accountPending = true;
        this.web3Handler.requestAccount();
        return;
      }
      
      this.showBuildTools = !this.showBuildTools;
      if (!this.showBuildTools) {
        this.currentView = "explore";
      }
      // TODO watch web3Handler for log-out events and turn off build mode
    },
    myNodesClick: async function() {
      if (this.web3Handler.loggedIn) {
        if (this.currentView !== "mynodes") {
          await this.updateMyNodeKeys();
          this.currentView = "mynodes";
        }
        else {
          this.currentView = "explore";
          // TODO delete ipfs data for currently-paged nodes?
        }
      }
    },
    updateMyNodeKeys: async function() {
      try {
        this.myNodeKeys = await this.contract.getNodesBelongingTo(this.web3Handler.account);
      }
      catch (error) {
        console.log(error);
      }
    },
    pagedToTheseNodeKeys: function(nodeKeys) {
      console.log("app pagedToTheseNodeKeys");
      
      // Request node data asynchronously and in parallel for all paged-to nodeKeys in myNodes.
      for (var keyKey in nodeKeys) {
        this.updateMyNodeData(nodeKeys[keyKey]);
      }
    },
    updateMyNodeData: async function(nodeKey) {
      try {
        let node = await this.contract.getNode(nodeKey);
        this.nodes[nodeKey] = node;
        //this.nodes[nodeKey].data = JSON.parse(await this.fetchIpfs(node.ipfs));
        /*
        console.log(this.$refs.mynodes);
        this.$refs.mynodes.$forceUpdate();
        console.log("Data loaded for " + nodeKey);
        */
      }
      catch (error) {
        console.log(error);
        this.nodes[nodeKey].data = JSON.stringify({
          failed: true,
          error: error
        });
      }
    }
  },
  created: function() {
    this.init();
  }
};
